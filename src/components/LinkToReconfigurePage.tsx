import React from "react";
import { useHistory } from "react-router-dom";
import { useVersionAnalytics, usePatchAnalytics } from "analytics";
import { DropdownItem } from "components/ButtonDropdown";
import { getPatchRoute } from "constants/routes";

export const LinkToReconfigurePage: React.VFC<{
  patchId: string;
  disabled?: boolean;
  hasVersion?: boolean;
}> = ({ patchId, disabled, hasVersion = true }) => {
  const { sendEvent } = (hasVersion ? useVersionAnalytics : usePatchAnalytics)(
    patchId
  );

  const router = useHistory();

  return (
    <DropdownItem
      data-cy="reconfigure-link"
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          sendEvent({ name: "Click Reconfigure Link" });
          router.push(getPatchRoute(patchId, { configure: true }));
        }
      }}
    >
      Reconfigure tasks/variants
    </DropdownItem>
  );
};
