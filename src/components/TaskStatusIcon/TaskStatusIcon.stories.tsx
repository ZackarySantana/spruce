import styled from "@emotion/styled";
import { withKnobs, select } from "@storybook/addon-knobs";
import { Size } from "components/Icon";
import { size } from "constants/tokens";
import { TaskStatus } from "types/task";
import { TaskStatusIcon } from ".";

export default {
  title: "Task Status Icons",
  decorators: [withKnobs],
  component: TaskStatusIcon,
};

export const AllStatuses = () => {
  // filter out umbrella statuses
  const taskStatuses = Object.keys(TaskStatus).filter(
    (taskName) => !taskName.includes("Umbrella")
  );
  return (
    <Container>
      {taskStatuses.map((status) => (
        <IconContainer key={status}>
          <TaskStatusIcon
            status={TaskStatus[status]}
            size={select("Size", Sizes, Sizes[Size.Default])}
          />
          <span>{status}</span>
        </IconContainer>
      ))}
    </Container>
  );
};

const Sizes = {
  [Size.Small]: 14,
  [Size.Default]: 16,
  [Size.Large]: 20,
  [Size.XLarge]: 24,
};

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
const IconContainer = styled.div`
  width: 150px;
  height: 70px;
  flex-shrink: 0;
  text-align: center;
  border: 1px solid #babdbe;
  border-radius: ${size.xxs};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin: 0.5rem;
`;
