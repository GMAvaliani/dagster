import * as React from 'react';

import {AssetKey} from '../types';

export const useFilterAssetKeys = (assetKeys: AssetKey[], queryString: string) => {
  const queryLowercase = queryString.toLocaleLowerCase();
  return React.useMemo(() => {
    if (queryLowercase === '') {
      return assetKeys;
    }
    return assetKeys.filter((assetKey) =>
      assetKey.path.some((part) => part.toLowerCase().includes(queryLowercase)),
    );
  }, [assetKeys, queryLowercase]);
};

export const useFilterPartitionNames = (partitionNames: string[], queryString: string) => {
  const queryLowercase = queryString.toLocaleLowerCase();
  return React.useMemo(() => {
    if (queryLowercase === '') {
      return partitionNames;
    }
    return partitionNames.filter((partitionName) =>
      partitionName.toLowerCase().includes(queryLowercase),
    );
  }, [partitionNames, queryLowercase]);
};
