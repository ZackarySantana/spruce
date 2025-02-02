import { Field } from "@rjsf/core";
import { SpruceFormProps } from "components/SpruceForm";
import { CardFieldTemplate } from "components/SpruceForm/FieldTemplates";
import widgets from "components/SpruceForm/Widgets";
import { form } from "../utils";
import { FormState } from "./types";

const { radioBoxOptions } = form;

export const getFormSchema = (
  repoData?: FormState
): {
  fields: Record<string, Field>;
  schema: SpruceFormProps["schema"];
  uiSchema: SpruceFormProps["uiSchema"];
} => ({
  fields: {},
  schema: {
    type: "object" as "object",
    properties: {
      buildBreakSettings: {
        type: "object" as "object",
        title: "Notifications",
        properties: {
          notifyOnBuildFailure: {
            type: ["boolean", "null"],
            title: "Build Break Notifications",
            oneOf: radioBoxOptions(
              ["Enabled", "Disabled"],
              repoData?.buildBreakSettings?.notifyOnBuildFailure
            ),
          },
        },
      },
      defaultSubscriptions: {
        type: "object" as "object",
        title: "Subscriptions",
        properties: {
          defaultToRepo: {
            type: "array" as "array",
            items: {
              type: "object" as "object",
              properties: {
                filePattern: {
                  type: "string" as "string",
                  title: "TODO: EVG-16262 - this is not implemented yet",
                },
              },
            },
          },
        },
      },
    },
  },
  uiSchema: {
    buildBreakSettings: {
      "ui:rootFieldId": "notifications",
      "ui:ObjectFieldTemplate": CardFieldTemplate,
      notifyOnBuildFailure: {
        "ui:widget": widgets.RadioBoxWidget,
        "ui:description":
          "Send notification of build breaks to admins of a project if the commit author is not signed up to receive notifications.",
      },
    },
    defaultSubscriptions: {
      defaultToRepo: {
        "ui:addButtonText": "Add New Subscription",
        "ui:orderable": false,
      },
    },
  },
});
