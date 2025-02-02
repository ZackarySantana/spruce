import { useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import styled from "@emotion/styled";
import { Variant } from "@leafygreen-ui/button";
import TextInput from "@leafygreen-ui/text-input";
import Tooltip from "@leafygreen-ui/tooltip";
import { Select } from "antd";
import { diff } from "deep-object-diff";
import isEqual from "lodash.isequal";
import { useSpawnAnalytics } from "analytics";
import { ConditionalWrapper } from "components/ConditionalWrapper";
import Icon from "components/Icon";
import { Modal } from "components/Modal";
import {
  ModalContent,
  SectionContainer,
  SectionLabel,
  WideButton,
  ExpirationField,
} from "components/Spawn";
import { ExpirationDateType } from "components/Spawn/ExpirationField";
import { InputLabel, StyledLink } from "components/styles";
import { windowsPasswordRulesURL } from "constants/externalResources";
import { size } from "constants/tokens";
import { useToastContext } from "context/toast";
import {
  InstanceTypesQuery,
  InstanceTypesQueryVariables,
  MyVolumesQuery,
  MyVolumesQueryVariables,
  EditSpawnHostMutation,
  EditSpawnHostMutationVariables,
  GetMyPublicKeysQuery,
  GetMyPublicKeysQueryVariables,
} from "gql/generated/types";
import { EDIT_SPAWN_HOST } from "gql/mutations";
import {
  GET_INSTANCE_TYPES,
  GET_MY_PUBLIC_KEYS,
  GET_MY_VOLUMES,
} from "gql/queries";
import {
  VolumesField,
  UserTagsField,
  VolumesData,
  UserTagsData,
} from "pages/spawn/spawnHost/fields";
import { HostStatus } from "types/host";
import { MyHost } from "types/spawn";
import { string } from "utils";
import { useEditSpawnHostModalState } from "./editSpawnHostModal/useEditSpawnHostModalState";
import {
  PublicKeyForm,
  publicKeyStateType,
} from "./spawnHostModal/PublicKeyForm";

const { Option } = Select;
const { omitTypename, stripNewLines } = string;

interface EditSpawnHostModalProps {
  visible?: boolean;
  onCancel: () => void;
  host: MyHost;
}
export const EditSpawnHostModal: React.VFC<EditSpawnHostModalProps> = ({
  visible = true,
  onCancel,
  host,
}) => {
  const dispatchToast = useToastContext();

  const spawnAnalytics = useSpawnAnalytics();
  const { reducer, defaultEditSpawnHostState } = useEditSpawnHostModalState(
    host
  );
  const [editSpawnHostState, dispatch] = reducer;

  useEffect(() => {
    dispatch({ type: "reset", host });
  }, [visible, dispatch, host]);

  // QUERY get_instance_types
  const { data: instanceTypesData } = useQuery<
    InstanceTypesQuery,
    InstanceTypesQueryVariables
  >(GET_INSTANCE_TYPES);

  // QUERY volumes
  const { data: volumesData } = useQuery<
    MyVolumesQuery,
    MyVolumesQueryVariables
  >(GET_MY_VOLUMES);

  // QUERY public keys
  const { data: publicKeysData } = useQuery<
    GetMyPublicKeysQuery,
    GetMyPublicKeysQueryVariables
  >(GET_MY_PUBLIC_KEYS);

  // UPDATE HOST STATUS MUTATION
  const [editSpawnHostMutation, { loading: loadingSpawnHost }] = useMutation<
    EditSpawnHostMutation,
    EditSpawnHostMutationVariables
  >(EDIT_SPAWN_HOST, {
    onCompleted(mutationResult) {
      const { id } = mutationResult?.editSpawnHost;

      dispatchToast.success(`Successfully modified spawned host: ${id}`);
      onCancel();
    },
    onError(err) {
      onCancel();
      dispatchToast.error(
        `There was an error while modifying your host: ${err.message}`
      );
    },
    refetchQueries: ["MyVolumes"],
  });

  const instanceTypes = instanceTypesData?.instanceTypes;
  const volumes = volumesData?.myVolumes?.filter(
    (v) => v.availabilityZone === host.availabilityZone
  );
  const publicKeys = publicKeysData?.myPublicKeys;

  const [hasChanges, mutationParams] = computeDiff(
    defaultEditSpawnHostState,
    editSpawnHostState
  );

  const onSubmit = (e) => {
    e.preventDefault();

    spawnAnalytics.sendEvent({
      name: "Edited a Spawn Host",
      params: {
        hostId: host.id,
        ...mutationParams,
      },
    });
    editSpawnHostMutation({
      variables: {
        hostId: host.id,
        ...mutationParams,
      },
    });
  };

  const canEditInstanceType = host.status === HostStatus.Stopped; // User can only update the instance type when it is paused
  const canEditRDPPassword =
    host.distro.isWindows && host.status === HostStatus.Running;
  return (
    <Modal
      title="Edit Host Details"
      visible={visible}
      onCancel={onCancel}
      footer={[
        // @ts-expect-error
        <WideButton onClick={onCancel} key="cancel_button">
          Cancel
        </WideButton>,
        <WideButton
          data-cy="save-spawn-host-button"
          disabled={hasChanges || loadingSpawnHost} // @ts-expect-error
          onClick={onSubmit}
          variant={Variant.Primary}
          key="save_spawn_host_button"
        >
          {loadingSpawnHost ? "Saving" : "Save"}
        </WideButton>,
      ]}
      data-cy="edit-spawn-host-modal"
    >
      <ModalContent>
        <SectionContainer>
          <SectionLabel weight="medium">Host Name</SectionLabel>
          <ModalContent>
            <TextInput
              label="Host Name"
              id="hostNameInput"
              value={editSpawnHostState.displayName}
              onChange={(e) =>
                dispatch({ type: "editHostName", displayName: e.target.value })
              }
            />
          </ModalContent>
        </SectionContainer>
        <ExpirationField
          isVolume={false}
          targetItem={host}
          data={editSpawnHostState}
          onChange={(data: ExpirationDateType) =>
            dispatch({ type: "editExpiration", ...data })
          }
        />
        <SectionContainer>
          <SectionLabel weight="medium">Instance Type</SectionLabel>
          <ModalContent>
            <InputLabel htmlFor="instanceTypeDropdown">
              Instance Types
            </InputLabel>
            <ConditionalWrapper
              condition={!canEditInstanceType}
              wrapper={(children) => (
                <Tooltip
                  align="top"
                  justify="middle"
                  usePortal={false}
                  triggerEvent="hover"
                  trigger={children}
                >
                  Pause this host to adjust this field.
                </Tooltip>
              )}
            >
              <div>
                <Select
                  id="instanceTypeDropdown"
                  showSearch
                  style={{ width: 200 }}
                  placeholder="Select instance type"
                  onChange={(v) =>
                    dispatch({
                      type: "editInstanceType",
                      instanceType: v,
                    })
                  }
                  value={editSpawnHostState.instanceType}
                  disabled={!canEditInstanceType}
                >
                  {instanceTypes?.map((instance) => (
                    <Option
                      value={instance}
                      key={`instance_type_option_${instance}`}
                    >
                      {instance}
                    </Option>
                  ))}
                </Select>
              </div>
            </ConditionalWrapper>
          </ModalContent>
        </SectionContainer>
        <SectionContainer>
          <SectionLabel weight="medium">Add Volume</SectionLabel>
          <VolumesField
            data={editSpawnHostState}
            onChange={(data: VolumesData) =>
              dispatch({ type: "editVolumes", ...data })
            }
            volumes={volumes}
          />
        </SectionContainer>
        {canEditRDPPassword && (
          <SectionContainer>
            <SectionLabel weight="medium">Set RDP Password</SectionLabel>
            <ModalContent>
              <FlexContainer>
                <TextInput
                  label="Set New RDP Password"
                  value={editSpawnHostState.servicePassword}
                  onChange={(e) =>
                    dispatch({
                      type: "editServicePassword",
                      servicePassword: e.target.value,
                    })
                  }
                  id="rdpPasswordInput"
                  type="password"
                />
                <Tooltip
                  align="top"
                  justify="end"
                  triggerEvent="hover"
                  usePortal={false}
                  trigger={
                    <div>
                      <PaddedIcon glyph="QuestionMarkWithCircle" />
                    </div>
                  }
                >
                  <>
                    Password should match the criteria defined{" "}
                    <StyledLink href={windowsPasswordRulesURL} target="__blank">
                      here.
                    </StyledLink>
                  </>
                </Tooltip>
              </FlexContainer>
            </ModalContent>
          </SectionContainer>
        )}
        <SectionContainer>
          <SectionLabel weight="medium">User Tags</SectionLabel>
          <UserTagsField
            onChange={(data: UserTagsData) =>
              dispatch({ type: "editInstanceTags", ...data })
            }
            instanceTags={host?.instanceTags}
            visible={visible}
          />
        </SectionContainer>
        <SectionContainer>
          <SectionLabel weight="medium">Add SSH Key</SectionLabel>
          <PublicKeyForm
            publicKeys={publicKeys}
            data={editSpawnHostState}
            onChange={(data: publicKeyStateType) =>
              dispatch({ type: "editPublicKey", ...data })
            }
          />
        </SectionContainer>
      </ModalContent>
    </Modal>
  );
};

const computeDiff = (defaultEditSpawnHostState, editSpawnHostState) => {
  const hasChanges = isEqual(defaultEditSpawnHostState, editSpawnHostState);

  // diff will return an untyped object which doesn't allow access to the properties so we must
  // type it inorder to have access to its properties.
  const mutationParams = diff(
    defaultEditSpawnHostState,
    editSpawnHostState
  ) as EditSpawnHostMutationVariables;

  if (mutationParams.publicKey) {
    const keyToSubmit = mutationParams.publicKey;
    mutationParams.publicKey = omitTypename({
      name: keyToSubmit?.name || "",
      key: stripNewLines(keyToSubmit?.key || ""),
    });
  }
  // diff returns an object to compare the differences in positions of an array. So we take this object
  // and convert it into an array for these fields
  if (mutationParams.addedInstanceTags) {
    mutationParams.addedInstanceTags = omitTypename(
      Object.values(mutationParams.addedInstanceTags)
    );
  }
  if (mutationParams.deletedInstanceTags) {
    mutationParams.deletedInstanceTags = omitTypename(
      Object.values(mutationParams.deletedInstanceTags)
    );
  }

  return [hasChanges, mutationParams];
};

const PaddedIcon = styled(Icon)`
  margin-left: ${size.s};
  margin-top: ${size.m};
`;
const FlexContainer = styled.div`
  display: flex;
  align-items: center;
`;
