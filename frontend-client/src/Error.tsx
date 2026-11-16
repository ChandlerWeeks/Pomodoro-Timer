interface ErrorProps {
  message: string;
  severity: number;
}

function Error({ message, severity }: ErrorProps) {
  let color: string;
  let border_color = "black";
  switch (severity) {
    case 0:
      color = "bg-red-300";
      border_color = "border-red-400"
      break;
    case 1:
      color = "bg-orange-300";
      border_color = "border-orange-400"
      break;
    case 2:
      color = "bg-yellow-300";
      border_color = "border-yellow-400";
      break;
    default:
      color = "bg-green-400";
      border_color = "border-black"
  }

  return (
    <div role="alert" className={`w-full text-center ${color} p-4 rounded-md ${border_color} border-full border-2`}>
      {message}
    </div>
  );
}

export default Error;
