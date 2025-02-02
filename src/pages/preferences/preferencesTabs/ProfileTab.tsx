import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import styled from "@emotion/styled";
import Button, { Variant } from "@leafygreen-ui/button";
import Card from "@leafygreen-ui/card";
import { Option, Select } from "@leafygreen-ui/select";
import TextInput from "@leafygreen-ui/text-input";
import { Skeleton } from "antd";
import { usePreferencesAnalytics } from "analytics";
import { timeZones } from "constants/fieldMaps";
import { size } from "constants/tokens";
import { useToastContext } from "context/toast";
import {
  UpdateUserSettingsMutation,
  UpdateUserSettingsMutationVariables,
  AwsRegionsQuery,
} from "gql/generated/types";
import { UPDATE_USER_SETTINGS } from "gql/mutations";
import { GET_AWS_REGIONS } from "gql/queries";
import { useUserSettings } from "hooks";
import { string } from "utils";

const { omitTypename } = string;

export const ProfileTab: React.VFC = () => {
  const { sendEvent } = usePreferencesAnalytics();
  const dispatchToast = useToastContext();

  const { userSettings, loading } = useUserSettings();
  const { githubUser, timezone, region } = userSettings ?? {};
  const lastKnownAs = githubUser?.lastKnownAs || "";

  const [timezoneField, setTimezoneField] = useState<string>(timezone);
  const [regionField, setRegionField] = useState<string>(region);
  const [githubUsernameField, setGithubUsernameField] = useState<string>(
    lastKnownAs
  );

  useEffect(() => {
    setGithubUsernameField(githubUser?.lastKnownAs);
    setTimezoneField(timezone);
    setRegionField(region);
  }, [githubUser, timezone, region]);

  const [updateUserSettings, { loading: updateLoading }] = useMutation<
    UpdateUserSettingsMutation,
    UpdateUserSettingsMutationVariables
  >(UPDATE_USER_SETTINGS, {
    onCompleted: () => {
      dispatchToast.success(`Your changes have successfully been saved.`);
    },
    onError: (err) => {
      dispatchToast.error(`Error while saving settings: '${err.message}'`);
    },
  });

  const {
    data: awsRegionData,
    loading: awsRegionLoading,
  } = useQuery<AwsRegionsQuery>(GET_AWS_REGIONS);
  const awsRegions = awsRegionData?.awsRegions || [];

  const handleSave = async (e): Promise<void> => {
    e.preventDefault();

    const variables = {
      userSettings: {
        githubUser: {
          ...omitTypename(githubUser),
          lastKnownAs: githubUsernameField,
        },
        timezone: timezoneField,
        region: regionField,
      },
    };
    sendEvent({
      name: "Save Profile Info",
      params: variables,
    });
    try {
      await updateUserSettings({
        variables,
        refetchQueries: ["GetUserSettings"],
      });
    } catch (err) {}
  };

  const hasFieldUpdates =
    lastKnownAs !== githubUsernameField ||
    timezone !== timezoneField ||
    region !== regionField;

  if (loading || awsRegionLoading) {
    return <Skeleton active />;
  }

  return (
    <div>
      {/* @ts-expect-error */}
      <PreferencesCard>
        <ContentWrapper>
          <StyledTextInput
            label="Github Username"
            onChange={handleFieldUpdate(setGithubUsernameField)}
            value={githubUsernameField}
          />
          <StyledSelect
            label="Timezone"
            placeholder="Select timezone"
            defaultValue={timezoneField}
            onChange={handleFieldUpdate(setTimezoneField)}
            data-cy="timezone-field"
          >
            {timeZones.map((timeZone) => (
              <Option
                value={timeZone.value}
                key={timeZone.value}
                data-cy={`${timeZone.str}-option`}
              >
                {timeZone.str}
              </Option>
            ))}
          </StyledSelect>
          <StyledSelect
            label="AWS Region"
            placeholder="Select AWS region"
            defaultValue={regionField}
            onChange={handleFieldUpdate(setRegionField)}
          >
            {awsRegions.map((awsRegion) => (
              <Option value={awsRegion} key={awsRegion}>
                {awsRegion}
              </Option>
            ))}
          </StyledSelect>
          <Button
            data-cy="save-profile-changes-button"
            variant={Variant.Primary}
            disabled={!hasFieldUpdates || updateLoading}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </ContentWrapper>
      </PreferencesCard>
    </div>
  );
};

const handleFieldUpdate = (stateUpdate) => (e) => {
  if (typeof e === "string") {
    stateUpdate(e); // Antd select just passes in the value string instead of an event
  } else {
    stateUpdate(e.target.value);
  }
};

// @ts-expect-error
const StyledSelect = styled(Select)`
  width: 100%;
  margin-bottom: ${size.m};
  :last-child {
    margin-bottom: 40px;
  }
`;

const StyledTextInput = styled(TextInput)`
  margin-bottom: ${size.m};
  :last-child {
    margin-bottom: 40px;
  }
`;

const ContentWrapper = styled.div`
  width: 50%;
`;

// @ts-expect-error
const PreferencesCard = styled(Card)`
  padding-left: ${size.m};
  padding-top: ${size.m};
  padding-bottom: 40px;
  margin-bottom: 30px;
  width: 100%;
`;
