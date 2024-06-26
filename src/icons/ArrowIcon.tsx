interface ArrowIconProps {
  color?: string;
  mirror?: boolean;
}

export const ArrowIcon: React.FC<ArrowIconProps> = ({
  color = "#CBB6E5",
  mirror = false,
}) => {
  return (
    <svg
      className={`${mirror && "-rotate-180"}`}
      width="11"
      height="14"
      viewBox="0 0 11 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.5 7.86602C11.1667 7.48112 11.1667 6.51888 10.5 6.13397L1.5 0.937821C0.833334 0.552921 6.10471e-07 1.03405 5.76822e-07 1.80385L1.2256e-07 12.1962C8.8911e-08 12.966 0.833333 13.4471 1.5 13.0622L10.5 7.86602Z"
        fill={color}
      />
    </svg>
  );
};
