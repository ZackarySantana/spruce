import React from "react";
import styled from "@emotion/styled";
import { ExtendableBox } from "@leafygreen-ui/box";
import Button, { ButtonProps } from "@leafygreen-ui/button";
import { Body, H2 } from "@leafygreen-ui/typography";
import { Table } from "antd";
import Badge from "components/Badge";
import Icon from "components/Icon";
import { size } from "constants/tokens";

export const Title = H2;

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const BadgeWrapper = styled.div`
  display: flex;
`;

export const StyledBadge = styled(Badge)`
  margin: 0 ${size.xs};
`;

export const PlusButton: ExtendableBox<
  ButtonProps & { ref?: React.Ref<any> },
  "button"
> = React.forwardRef(({ leftGlyph, ...rest }: ButtonProps, forwardRef) => (
  <Button
    ref={forwardRef}
    {...{ ...rest, leftGlyph: <Icon glyph="Plus" /> }}
    as="button"
  />
));

const TableContainer = styled.div`
  overflow-x: scroll;
  width: 100%;
`;

export const SpawnTable: React.VFC<React.ComponentProps<typeof Table>> = (
  props
) => (
  <TableContainer>
    <Table
      {...{
        ...props,
        rowKey: (record) => record.id,
        pagination: false,
        expandRowByClick: true,
        expandIcon: ({ expanded, onExpand, record }) => {
          const onClick = (e) => {
            onExpand(record, e);
          };
          return (
            <span
              tabIndex={0}
              role="button"
              onClick={onClick}
              onKeyDown={onClick}
            >
              <Icon
                data-cy={`table-caret-icon-${record.id}`}
                glyph={expanded ? "CaretDown" : "CaretRight"}
              />
            </span>
          );
        },
      }}
    />
  </TableContainer>
);

export const DoesNotExpire = "Does not expire";

// @ts-expect-error
export const WideButton = styled(Button)`
  justify-content: center;
  width: 140px;
`;

export const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Section = styled(ModalContent)`
  margin-top: 20px;
`;

export const SectionContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: ${size.s};
`;

export const SectionLabel = styled(Body)`
  flex-grow: 1;
  padding-right: ${size.s};
  margin-top: ${size.m};
`;

// @ts-expect-error
export const PaddedButton = styled(Button)`
  margin-left: ${size.xxs};
  margin-right: ${size.xxs};
  flex-grow: 0;
`;

export const tooltipWidth = "250px";
