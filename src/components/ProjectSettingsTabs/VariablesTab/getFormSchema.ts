import { Field } from "@rjsf/core";
import { SpruceFormProps } from "components/SpruceForm";
import { CardFieldTemplate } from "components/SpruceForm/FieldTemplates";
import widgets from "components/SpruceForm/Widgets";
import { FormState } from "./types";
import { VariableRow } from "./VariableRow";

export const getFormSchema = (
  useRepoSettings: boolean,
  repoData?: FormState
): {
  fields: Record<string, Field>;
  schema: SpruceFormProps["schema"];
  uiSchema: SpruceFormProps["uiSchema"];
} => ({
  fields: {},
  schema: {
    definitions: {
      varsArray: {
        type: "array" as "array",
        items: {
          type: "object" as "object",
          properties: {
            varName: {
              type: "string" as "string",
              title: "Variable Name",
              format: "not-empty-string",
              default: "",
            },
            varValue: {
              type: "string" as "string",
              title: "Variable",
              format: "not-empty-string",
              default: "",
            },
            isPrivate: {
              type: "boolean" as "boolean",
              title: "Private",
            },
            isDisabled: {
              type: "boolean" as "boolean",
            },
          },
        },
      },
    },
    type: "object" as "object",
    properties: {
      vars: { $ref: "#/definitions/varsArray" },
      ...(repoData && {
        repoData: {
          type: "object" as "object",
          title: "Repo Project Variables",
          ...(repoData.vars.length === 0 && {
            description: "Repo has no variables defined.",
          }),
          properties: {
            vars: { $ref: "#/definitions/varsArray" },
          },
        },
      }),
    },
  },
  uiSchema: {
    "ui:ObjectFieldTemplate": CardFieldTemplate,
    vars: {
      "ui:addButtonText": "Add Variables",
      "ui:description": getDescription(useRepoSettings),
      "ui:fullWidth": true,
      "ui:showLabel": false,
      items: {
        "ui:ObjectFieldTemplate": VariableRow,
        options: { repoData },
        varName: {
          "ui:data-cy": "var-name-input",
        },
        varValue: {
          "ui:data-cy": "var-value-input",
          "ui:marginBottom": 4,
          "ui:widget": widgets.TextareaWidget,
        },
        isPrivate: {
          "ui:tooltipDescription":
            "Private variables have redacted values on the Project Page and the API and cannot be updated.",
          "ui:data-cy": "var-private-input",
        },
      },
    },
    repoData: {
      vars: {
        "ui:addable": false,
        "ui:fullWidth": true,
        "ui:readonly": true,
        "ui:showLabel": false,
        items: {
          "ui:ObjectFieldTemplate": VariableRow,
          varValue: {
            "ui:widget": widgets.TextareaWidget,
          },
        },
      },
    },
  },
});

const getDescription = (useRepoSettings: boolean): string => {
  // Repo page, where useRepoSettings field does not exist
  if (useRepoSettings === undefined) {
    return "Variables defined here will be used by all branches attached to this project, unless a variable is specifically overridden in the branch.";
  }
  // Project page
  return useRepoSettings
    ? "Variables are sourced from both the repo-level and branch-level settings. If a variable name is defined at both the repo-level and branch-level, then the branch variable will override the repo variable."
    : null;
};