import { useQuery } from "@apollo/client";
import { Skeleton } from "antd";
import { useParams, useLocation } from "react-router-dom";
import { useVersionAnalytics } from "analytics";
import { StyledRouterLink, SiderCard } from "components/styles";
import { Divider } from "components/styles/Divider";
import { H3, wordBreakCss } from "components/Typography";
import { VariantGroupedTaskStatusBadges } from "components/VariantGroupedTaskStatusBadges";
import { pollInterval } from "constants/index";
import { getVersionRoute } from "constants/routes";
import {
  GetBuildVariantStatsQuery,
  GetBuildVariantStatsQueryVariables,
  StatusCount,
} from "gql/generated/types";
import { GET_BUILD_VARIANTS_STATS } from "gql/queries";
import { usePolling } from "hooks";
import { queryString, string } from "utils";

const { parseQueryString } = queryString;
const { applyStrictRegex } = string;

export const BuildVariants: React.VFC = () => {
  const { id } = useParams<{ id: string }>();
  const { search } = useLocation();
  const { sorts } = parseQueryString(search);
  const { sendEvent } = useVersionAnalytics(id);

  const { data, loading, error, startPolling, stopPolling } = useQuery<
    GetBuildVariantStatsQuery,
    GetBuildVariantStatsQueryVariables
  >(GET_BUILD_VARIANTS_STATS, {
    variables: { id },
    pollInterval,
  });
  usePolling(startPolling, stopPolling);
  const { version } = data || {};

  return (
    <>
      {/* @ts-expect-error */}
      <SiderCard>
        <H3>Build Variants</H3>
        <Divider />
        {error && <div>{error.message}</div>}
        {loading && <Skeleton active title={false} paragraph={{ rows: 4 }} />}
        {version?.buildVariantStats?.map(
          ({ displayName, statusCounts, variant }) => (
            <div
              key={`buildVariant_${displayName}_${variant}`}
              data-cy="patch-build-variant"
            >
              <StyledRouterLink
                css={wordBreakCss}
                to={getVersionRoute(id, {
                  sorts,
                  page: 0,
                  variant: applyStrictRegex(variant),
                })}
                onClick={() =>
                  sendEvent({
                    name: "Click Build Variant Grid Link",
                  })
                }
                data-cy="build-variant-display-name"
              >
                {displayName}
              </StyledRouterLink>
              <VariantTaskGroup
                variant={variant}
                statusCounts={statusCounts}
                versionId={id}
              />
            </div>
          )
        )}
      </SiderCard>
    </>
  );
};

interface VariantTaskGroupProps {
  variant: string;
  statusCounts: StatusCount[];
  versionId: string;
}
const VariantTaskGroup: React.VFC<VariantTaskGroupProps> = ({
  variant,
  statusCounts,
  versionId,
}) => {
  const { sendEvent } = useVersionAnalytics(versionId);

  const callBack = (statuses: string[]) => () => {
    sendEvent({
      name: "Click Grouped Task Square",
      taskSquareStatuses: statuses,
    });
  };
  return (
    <VariantGroupedTaskStatusBadges
      variant={variant}
      statusCounts={statusCounts}
      versionId={versionId}
      onClick={callBack}
      preserveSorts
    />
  );
};
