import {gql} from '@apollo/client';
import {
  Body,
  Box,
  Caption,
  Colors,
  ConfigTypeSchema,
  Icon,
  Mono,
  Subheading,
} from '@dagster-io/ui-components';
import * as React from 'react';
import {Link} from 'react-router-dom';

import {COMMON_COLLATOR} from '../app/Util';
import {ASSET_NODE_FRAGMENT} from '../asset-graph/AssetNode';
import {isHiddenAssetGroupJob, LiveData, toGraphId} from '../asset-graph/Utils';
import {AssetNodeForGraphQueryFragment} from '../asset-graph/types/useAssetGraphData.types';
import {DagsterTypeSummary} from '../dagstertype/DagsterType';
import {Description} from '../pipelines/Description';
import {PipelineReference} from '../pipelines/PipelineReference';
import {ResourceContainer, ResourceHeader} from '../pipelines/SidebarOpHelpers';
import {buildRepoAddress} from '../workspace/buildRepoAddress';
import {RepoAddress} from '../workspace/types';
import {workspacePathFromAddress} from '../workspace/workspacePath';

import {ASSET_NODE_CONFIG_FRAGMENT} from './AssetConfig';
import {AssetDefinedInMultipleReposNotice} from './AssetDefinedInMultipleReposNotice';
import {
  AssetMetadataTable,
  ASSET_NODE_OP_METADATA_FRAGMENT,
  metadataForAssetNode,
} from './AssetMetadata';
import {AssetNodeList} from './AssetNodeList';
import {
  automaterializePolicyDescription,
  AutomaterializePolicyTag,
} from './AutomaterializePolicyTag';
import {DependsOnSelfBanner} from './DependsOnSelfBanner';
import {OverdueTag, freshnessPolicyDescription} from './OverdueTag';
import {UnderlyingOpsOrGraph} from './UnderlyingOpsOrGraph';
import {Version} from './Version';
import {AssetNodeDefinitionFragment} from './types/AssetNodeDefinition.types';

export const AssetNodeDefinition: React.FC<{
  assetNode: AssetNodeDefinitionFragment;
  upstream: AssetNodeForGraphQueryFragment[] | null;
  downstream: AssetNodeForGraphQueryFragment[] | null;
  liveDataByNode: LiveData;
  dependsOnSelf: boolean;
}> = ({assetNode, upstream, downstream, liveDataByNode, dependsOnSelf}) => {
  const {assetMetadata, assetType} = metadataForAssetNode(assetNode);
  const liveDataForNode = liveDataByNode[toGraphId(assetNode.assetKey)];

  const configType = assetNode.configField?.configType;
  const assetConfigSchema = configType && configType.key !== 'Any' ? configType : null;

  const repoAddress = buildRepoAddress(
    assetNode.repository.name,
    assetNode.repository.location.name,
  );

  return (
    <>
      <AssetDefinedInMultipleReposNotice
        assetKey={assetNode.assetKey}
        loadedFromRepo={repoAddress}
        padded={true}
      />
      <Box flex={{direction: 'row'}} style={{flex: 1}}>
        <Box
          style={{flex: 1, minWidth: 0}}
          flex={{direction: 'column'}}
          border={{side: 'right', width: 1, color: Colors.KeylineGray}}
        >
          <Box
            padding={{vertical: 16, horizontal: 24}}
            border={{side: 'bottom', width: 1, color: Colors.KeylineGray}}
            flex={{justifyContent: 'space-between', gap: 8}}
          >
            <Subheading>Description</Subheading>
            <DescriptionAnnotations assetNode={assetNode} repoAddress={repoAddress} />
          </Box>
          <Box
            padding={{vertical: 16, horizontal: 24}}
            style={{flex: 1, flexBasis: 'content', flexGrow: 0, minHeight: 123}}
          >
            {assetNode.description ? (
              <Description description={assetNode.description} maxHeight={260} />
            ) : (
              <Body>No description provided</Body>
            )}
          </Box>
          {assetNode.opVersion && (
            <>
              <Box
                padding={{vertical: 16, horizontal: 24}}
                border={{side: 'horizontal', width: 1, color: Colors.KeylineGray}}
              >
                <Subheading>Code version</Subheading>
              </Box>
              <Box padding={{vertical: 16, horizontal: 24}} flex={{gap: 12, alignItems: 'center'}}>
                <Version>{assetNode.opVersion}</Version>
              </Box>
            </>
          )}
          {assetNode.freshnessPolicy && (
            <>
              <Box
                padding={{vertical: 16, horizontal: 24}}
                border={{side: 'horizontal', width: 1, color: Colors.KeylineGray}}
              >
                <Subheading>Freshness policy</Subheading>
              </Box>
              <Box
                padding={{vertical: 16, horizontal: 24}}
                flex={{gap: 12, alignItems: 'flex-start'}}
              >
                <Body style={{flex: 1}}>
                  {freshnessPolicyDescription(assetNode.freshnessPolicy)}
                </Body>
                <OverdueTag
                  liveData={liveDataForNode}
                  policy={assetNode.freshnessPolicy}
                  assetKey={assetNode.assetKey}
                />
              </Box>
            </>
          )}
          {assetNode.autoMaterializePolicy && (
            <>
              <Box
                padding={{vertical: 16, horizontal: 24}}
                border={{side: 'horizontal', width: 1, color: Colors.KeylineGray}}
              >
                <Subheading>Auto-materialize policy</Subheading>
              </Box>
              <Box
                padding={{vertical: 16, horizontal: 24}}
                flex={{gap: 12, alignItems: 'flex-start'}}
              >
                <Body style={{flex: 1}}>
                  {automaterializePolicyDescription(assetNode.autoMaterializePolicy)}
                </Body>
                <AutomaterializePolicyTag policy={assetNode.autoMaterializePolicy} />
              </Box>
            </>
          )}
          <Box
            padding={{vertical: 16, horizontal: 24}}
            border={{side: 'horizontal', width: 1, color: Colors.KeylineGray}}
            flex={{justifyContent: 'space-between', gap: 8}}
          >
            <Subheading>
              Upstream assets{upstream?.length ? ` (${upstream.length})` : ''}
            </Subheading>
            <Link to="?view=lineage&lineageScope=upstream">
              <Box flex={{gap: 4, alignItems: 'center'}}>
                View upstream graph
                <Icon name="open_in_new" color={Colors.Link} />
              </Box>
            </Link>
          </Box>
          {dependsOnSelf && <DependsOnSelfBanner />}
          <AssetNodeList items={upstream} liveDataByNode={liveDataByNode} />
          <Box
            padding={{vertical: 16, horizontal: 24}}
            border={{side: 'horizontal', width: 1, color: Colors.KeylineGray}}
            flex={{justifyContent: 'space-between', gap: 8}}
          >
            <Subheading>
              Downstream assets{downstream?.length ? ` (${downstream.length})` : ''}
            </Subheading>
            <Link to="?view=lineage&lineageScope=downstream">
              <Box flex={{gap: 4, alignItems: 'center'}}>
                View downstream graph
                <Icon name="open_in_new" color={Colors.Link} />
              </Box>
            </Link>
          </Box>
          <AssetNodeList items={downstream} liveDataByNode={liveDataByNode} />
          {/** Ensures the line between the left and right columns goes to the bottom of the page */}
          <div style={{flex: 1}} />
        </Box>

        <Box
          border={{side: 'vertical', width: 1, color: Colors.KeylineGray}}
          style={{flex: 0.5, minWidth: 0}}
          flex={{direction: 'column'}}
        >
          <>
            <Box
              padding={{vertical: 16, horizontal: 24}}
              border={{side: 'bottom', width: 1, color: Colors.KeylineGray}}
            >
              <Subheading>Required resources</Subheading>
            </Box>
            <Box
              padding={{vertical: 16, horizontal: 24}}
              border={{side: 'bottom', width: 1, color: Colors.KeylineGray}}
            >
              {[...assetNode.requiredResources]
                .sort((a, b) => COMMON_COLLATOR.compare(a.resourceKey, b.resourceKey))
                .map((resource) => (
                  <ResourceContainer key={resource.resourceKey}>
                    <Icon name="resource" color={Colors.Gray700} />
                    {repoAddress ? (
                      <Link
                        to={workspacePathFromAddress(
                          repoAddress,
                          `/resources/${resource.resourceKey}`,
                        )}
                      >
                        <ResourceHeader>{resource.resourceKey}</ResourceHeader>
                      </Link>
                    ) : (
                      <ResourceHeader>{resource.resourceKey}</ResourceHeader>
                    )}
                  </ResourceContainer>
                ))}
              {assetNode.requiredResources.length === 0 && (
                <Body>
                  No required resources to display
                  <Box padding={{top: 4}}>
                    <a href="https://docs.dagster.io/concepts/resources#using-software-defined-assets">
                      View documentation
                    </a>
                  </Box>
                </Body>
              )}
            </Box>
          </>

          <>
            <Box
              padding={{vertical: 16, horizontal: 24}}
              border={{side: 'bottom', width: 1, color: Colors.KeylineGray}}
            >
              <Subheading>Config</Subheading>
            </Box>
            <Box
              padding={{vertical: 16, horizontal: 24}}
              border={{side: 'bottom', width: 1, color: Colors.KeylineGray}}
            >
              {assetConfigSchema ? (
                <ConfigTypeSchema
                  type={assetConfigSchema}
                  typesInScope={assetConfigSchema.recursiveConfigTypes}
                />
              ) : (
                <Body>
                  No config schema defined
                  <Box padding={{top: 4}}>
                    <a href="https://docs.dagster.io/concepts/assets/software-defined-assets#asset-configuration">
                      View documentation
                    </a>
                  </Box>
                </Body>
              )}
            </Box>
          </>

          <>
            <Box
              padding={{vertical: 16, horizontal: 24}}
              border={{side: 'bottom', width: 1, color: Colors.KeylineGray}}
            >
              <Subheading>Type</Subheading>
            </Box>
            {assetType && assetType.displayName !== 'Any' ? (
              <DagsterTypeSummary type={assetType} />
            ) : (
              <Box padding={{vertical: 16, horizontal: 24}}>
                <Body>
                  No input and output type data defined
                  <Box padding={{top: 4}}>
                    <a href="https://docs.dagster.io/concepts/types#overview">View documentation</a>
                  </Box>
                </Body>
              </Box>
            )}
          </>

          <>
            <Box
              padding={{vertical: 16, horizontal: 24}}
              border={{side: 'horizontal', width: 1, color: Colors.KeylineGray}}
              flex={{justifyContent: 'space-between', gap: 8}}
            >
              <Subheading>Metadata</Subheading>
            </Box>
            <Box style={{flex: 1}}>
              {assetMetadata.length > 0 ? (
                <AssetMetadataTable
                  assetMetadata={assetMetadata}
                  repoLocation={repoAddress?.location}
                />
              ) : (
                <Box padding={{vertical: 16, horizontal: 24}}>
                  <Body>
                    No asset definition metadata defined
                    <Box padding={{top: 4}}>
                      <a href="https://docs.dagster.io/concepts/assets/software-defined-assets#attaching-definition-metadata">
                        View documentation
                      </a>
                    </Box>
                  </Body>
                </Box>
              )}
            </Box>
          </>
        </Box>
      </Box>
    </>
  );
};

const DescriptionAnnotations: React.FC<{
  assetNode: AssetNodeDefinitionFragment;
  repoAddress: RepoAddress;
}> = ({assetNode, repoAddress}) => (
  <Box flex={{alignItems: 'baseline', gap: 16, wrap: 'wrap'}} style={{lineHeight: 0}}>
    {assetNode.jobNames
      .filter((jobName) => !isHiddenAssetGroupJob(jobName))
      .map((jobName) => (
        <Mono key={jobName}>
          <PipelineReference
            isJob
            showIcon
            pipelineName={jobName}
            pipelineHrefContext={repoAddress}
          />
        </Mono>
      ))}
    <UnderlyingOpsOrGraph assetNode={assetNode} repoAddress={repoAddress} />
    {assetNode.isSource && (
      <Caption style={{lineHeight: '16px', marginTop: 2}}>Source Asset</Caption>
    )}
  </Box>
);

export const ASSET_NODE_DEFINITION_FRAGMENT = gql`
  fragment AssetNodeDefinitionFragment on AssetNode {
    id
    description
    graphName
    opNames
    opVersion
    jobNames
    autoMaterializePolicy {
      policyType
    }
    freshnessPolicy {
      maximumLagMinutes
      cronSchedule
      cronScheduleTimezone
    }

    partitionDefinition {
      description
    }
    repository {
      id
      name
      location {
        id
        name
      }
    }
    requiredResources {
      resourceKey
    }

    ...AssetNodeConfigFragment
    ...AssetNodeFragment
    ...AssetNodeOpMetadataFragment
  }

  ${ASSET_NODE_CONFIG_FRAGMENT}
  ${ASSET_NODE_FRAGMENT}
  ${ASSET_NODE_OP_METADATA_FRAGMENT}
`;
