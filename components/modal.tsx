import { X } from "lucide-react";

export function Modal({
  open,
  setOpen,
  heading,
  children,
  actionFunc,
  className,
  hideCloseButton,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  heading?: string | React.ReactNode;
  children?: React.ReactNode;
  actionFunc?: () => void;
  className?: string;
  hideCloseButton?: boolean;
}) {
  return (
    open && (
      <div
        className={`fixed bg-black/20 flex justify-center items-center min-h-screen min-w-screen top-0 left-0 px-8`}
      >
        <div
          className={`rounded-lg bg-white p-6 min-w-[300px] md:min-w-[450px] min-h-[200px]  ${className}`}
        >
          <div className="flex flex-row justify-between items-center">
            {heading && (
              <h1 className="text-[1.5rem] font-medium">{heading}</h1>
            )}
            {!hideCloseButton && (
              <div onClick={() => setOpen(false)}>
                <X className="w-6 " />
              </div>
            )}
          </div>
          <div>{children}</div>
        </div>
      </div>
    )
  );
}
