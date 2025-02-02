import { useMutation } from "@apollo/client";
import styled from "@emotion/styled";
import Button, { Variant } from "@leafygreen-ui/button";
import Icon from "@leafygreen-ui/icon";
import { uiColors } from "@leafygreen-ui/palette";
import TextInput from "@leafygreen-ui/text-input";
import { Body } from "@leafygreen-ui/typography";
import { Select } from "antd";
import get from "lodash/get";
import set from "lodash/set";
import { Modal } from "components/Modal";
import { RegexSelectorInput } from "components/NotificationModal/RegexSelectorInput";
import { ErrorMessage } from "components/styles";
import { fontSize, size } from "constants/tokens";
import { useToastContext } from "context/toast";
import {
  SaveSubscriptionMutation,
  SaveSubscriptionMutationVariables,
} from "gql/generated/types";
import { SAVE_SUBSCRIPTION } from "gql/mutations";
import {
  useNotificationModal,
  UseNotificationModalProps,
} from "hooks/useNotificationModal";
import { SubscriptionMethodDropdownOption } from "types/subscription";

const { Option } = Select;
const { gray } = uiColors;
interface NotificationModalProps extends UseNotificationModalProps {
  subscriptionMethodDropdownOptions: SubscriptionMethodDropdownOption[];
  sendAnalyticsEvent: (
    subscription: SaveSubscriptionMutationVariables["subscription"]
  ) => void;
  visible: boolean;
  onCancel: (e?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  "data-cy": string;
  type: "task" | "version";
}

export const NotificationModal: React.VFC<NotificationModalProps> = ({
  visible,
  onCancel,
  subscriptionMethodDropdownOptions,
  subscriptionMethodControls,
  triggers,
  resourceId,
  sendAnalyticsEvent,
  "data-cy": dataCy,
  type,
}) => {
  const dispatchToast = useToastContext();
  const [saveSubscription] = useMutation<
    SaveSubscriptionMutation,
    SaveSubscriptionMutationVariables
  >(SAVE_SUBSCRIPTION, {
    onCompleted: () => {
      dispatchToast.success("Your subscription has been added");
    },
    onError: (err) => {
      dispatchToast.error(`Error adding your subscription: '${err.message}'`);
    },
  });

  const {
    disableAddCriteria,
    extraFieldErrorMessages,
    extraFieldInputVals,
    extraFields,
    getRequestPayload,
    isFormValid,
    onClickAddRegexSelector,
    regexSelectorProps,
    selectedSubscriptionMethod,
    selectedTriggerIndex,
    setExtraFieldInputVals,
    setSelectedSubscriptionMethod,
    setSelectedTriggerIndex,
    setTarget,
    showAddCriteria,
    target,
  } = useNotificationModal({
    subscriptionMethodControls,
    triggers,
    resourceId,
    type,
  });
  const onClickSave = () => {
    const subscription = getRequestPayload();
    saveSubscription({
      variables: { subscription },
    });
    sendAnalyticsEvent(subscription);
    onCancel();
  };
  const currentMethodControl = subscriptionMethodControls[
    selectedSubscriptionMethod
  ] as SubscriptionMethodControl;
  const label = get(currentMethodControl, "label");
  const placeholder = get(currentMethodControl, "placeholder");
  const targetPath = get(currentMethodControl, "targetPath");

  return (
    <Modal
      data-cy={dataCy}
      visible={visible}
      onCancel={onCancel}
      title="Add Subscription"
      footer={
        <>
          {}
          <LeftButton
            key="cancel" /* ts-expect-error */
            /* ts-expect-error */ onClick={onCancel} /* ts-expect-error */
            data-cy="cancel-subscription-button"
          >
            Cancel
          </LeftButton>
          <Button
            key="save"
            data-cy="save-subscription-button"
            disabled={!isFormValid}
            onClick={onClickSave}
            variant={Variant.Primary}
          >
            Save
          </Button>
        </>
      }
    >
      <Section>
        <Body weight="medium">Choose an event</Body>
        <SectionLabelContainer>
          <InputLabel htmlFor="event-select">Event</InputLabel>
        </SectionLabelContainer>
        <StyledSelect
          value={selectedTriggerIndex}
          onChange={(v: number) => {
            setSelectedTriggerIndex(v);
          }}
          data-cy="when-select"
          id="event-select"
        >
          {triggers.map((t, i) => (
            <Option
              key={`trigger_${t.trigger}_${t.resourceType}_${t.payloadResourceIdKey}`}
              value={i}
              data-cy={`trigger_${i}-option`}
            >
              {t.label}
            </Option>
          ))}
        </StyledSelect>
        {extraFields &&
          extraFields.map(({ text, key, dataCy: inputDataCy }) => (
            <ExtraFieldContainer key={key}>
              <StyledInput
                label={text}
                data-cy={inputDataCy}
                id={`${key}-input`}
                onChange={(event) => {
                  setExtraFieldInputVals({
                    ...extraFieldInputVals,
                    [key]: event.target.value,
                  });
                }}
                value={extraFieldInputVals[key]}
              />
            </ExtraFieldContainer>
          ))}
        {showAddCriteria && (
          <>
            <RegexSelectorInputContainer>
              {regexSelectorProps.map((props, i) => (
                <RegexSelectorInput
                  canDelete
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${props.dataCyPrefix}_${i}`}
                  dataCyPrefix={i}
                  {...props}
                />
              ))}
            </RegexSelectorInputContainer>
            <Button
              data-cy="add-regex-selector-button"
              disabled={disableAddCriteria}
              onClick={onClickAddRegexSelector}
            >
              <Icon glyph="Plus" />
              Add additional criteria
            </Button>
          </>
        )}
      </Section>
      <div>
        <Body weight="medium">Choose how to be notified</Body>
        <SectionLabelContainer>
          <InputLabel htmlFor="notify-by-select">
            Notification method
          </InputLabel>
        </SectionLabelContainer>
        <StyledSelect
          id="notify-by-select"
          data-cy="notify-by-select"
          value={selectedSubscriptionMethod}
          onChange={(v: string) => {
            setSelectedSubscriptionMethod(v);
          }}
        >
          {subscriptionMethodDropdownOptions.map((s) => (
            <Option key={s.value} value={s.value} data-cy={`${s.value}-option`}>
              {s.label}
            </Option>
          ))}
        </StyledSelect>
      </div>
      <div>
        {currentMethodControl && (
          <StyledInput
            label={label}
            id="target"
            placeholder={placeholder}
            data-cy={`${targetPath}-input`}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const targetCopy = { ...target };
              set(targetCopy, targetPath, event.target.value);
              setTarget(targetCopy);
            }}
            value={target[targetPath] ?? ""}
          />
        )}
      </div>
      <div>
        {extraFieldErrorMessages.map((text) => (
          <span key={`field_error_${text}`} data-cy="error-message">
            <ErrorMessage>{text}</ErrorMessage>
          </span>
        ))}
      </div>
    </Modal>
  );
};

export interface SubscriptionMethodControl {
  label: string;
  placeholder: string;
  targetPath: string;
  validator: (v: string) => boolean;
}

export type ResourceType = "TASK" | "BUILD";

const inputWidth = "width: calc(80% - 55px);";

const StyledSelect = styled(Select)`
  ${inputWidth}
  margin-bottom: ${size.xs};
`;

const StyledInput = styled(TextInput)`
  ${inputWidth}
`;

const ExtraFieldContainer = styled.div`
  margin-bottom: ${size.xs};
`;

const Section = styled.div`
  padding-bottom: ${size.m};
  margin-bottom: ${size.m};
  border-bottom: 1px solid ${gray.light2};
`;

const RegexSelectorInputContainer = styled.div`
  padding-top: ${size.xs};
`;
const SectionLabelContainer = styled.div`
  padding-top: ${size.s};
`;

/* @ts-expect-error */
const LeftButton = styled(Button)`
  margin-right: ${size.s};
` as typeof Button;

const InputLabel = styled.label`
  font-size: ${fontSize.m};
  font-weight: bold;
`;
