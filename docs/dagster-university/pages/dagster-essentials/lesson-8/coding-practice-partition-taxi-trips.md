---
title: "Lesson 8: Practice: Partition the taxi_trips asset"
module: "dagster_essentials"
lesson: "8"
---

# Practice: Partition the taxi_trips asset

To practice what you’ve learned, partition the `taxi_trips` asset by month using the following guidelines:

- Because a month’s parquet file may contain historical data from outside the month, it is recommended that you partition by the month of the parquet file, not the month of the trip
- With every partition, insert the new data into the `taxi_trips` table
- For convenience, add a `partition_date` column to represent which partition the record was inserted from. You’ll need to drop the existing `taxi_trips` because of the new `partition_date` column. In a Python REPL or scratch script, run the following:
    
    ```yaml
    import duckdb
    conn = duckdb.connect(database="data/staging/data.duckdb")
    conn.execute("drop table trips;")
    ```
- Because the `taxi_trips` table will exist after the first partition materializes, the SQL query will have to change
- In this asset, you’ll need to do three actions:
    - Create the `taxi_trips` table if it doesn’t already exist
    - Delete any old data from that `partition_date` to prevent duplicates when backfilling
    - Insert new records from the month’s parquet file

---

## Check your work

The updated asset should look similar to the code contained in the **View answer** toggle. Click to open it.

```python
from dagster import asset
from .partitions import monthly_partitions

@asset(
  deps=["taxi_trips_file"],
  partitions_def=monthly_partition,
)
def taxi_trips(context, database: DuckDBResource):
    """
      The raw taxi trips dataset, loaded into a DuckDB database, partitioned by month.
    """

    partition_date_str = context.asset_partition_key_for_output()
    month_to_fetch = partition_date_str[:-3]

    query = f"""
      create table if not exists trips (
        vendor_id integer, pickup_zone_id integer, dropoff_zone_id integer,
        rate_code_id double, payment_type integer, dropoff_datetime timestamp,
        pickup_datetime timestamp, trip_distance double, passenger_count double,
        total_amount double, partition_date varchar
      );

      delete from trips where partition_date = '{month_to_fetch}';
  
      insert into trips
      select
        VendorID, PULocationID, DOLocationID, RatecodeID, payment_type, tpep_dropoff_datetime, 
        tpep_pickup_datetime, trip_distance, passenger_count, total_amount, '{month_to_fetch}' as partition_date
      from '{constants.TAXI_TRIPS_TEMPLATE_FILE_PATH.format(month_to_fetch)}';
    """

    with database.get_connection() as conn:
      conn.execute(query)
```

**If there are differences**, compare what you wrote to the asset above and change them, as this asset will be used as-is in future lessons.