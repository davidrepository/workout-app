interface IProps {
  as?: React.ElementType;
  text?: string;
}

export const Heading = (props: IProps) => {
  const { as: Component = "h2", text, ...rest } = props;
  return <Component className="text-2xl font-medium">{text}</Component>;
};
