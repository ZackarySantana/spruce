import React, { useState } from "react";
import Button, { Size } from "@leafygreen-ui/button";
import { MyVolume } from "types/spawn";
import { MountVolumeModal } from "./mountButton/MountVolumeModal";

interface Props {
  volume: MyVolume;
}

export const MountBtn: React.VFC<Props> = ({ volume }) => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <Button
        size={Size.XSmall}
        data-cy={`attach-btn-${volume.displayName || volume.id}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpenModal(true);
        }}
      >
        Mount
      </Button>
      <MountVolumeModal
        visible={openModal}
        onCancel={() => setOpenModal(false)}
        volume={volume}
      />
    </>
  );
};
