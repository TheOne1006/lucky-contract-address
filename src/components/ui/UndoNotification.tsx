import clsx from "clsx"
import { ToastContentProps } from "react-toastify"

type UndoNotificationData = {
  title: string
  undoText?: string
  color?: string
  onUndo: () => void
}

export function UndoNotification({
  closeToast,
  data,
}: ToastContentProps<UndoNotificationData>) {
  const handleUndo = () => {
    data.onUndo()
    // closeToast let you provide a reason for the closure
    closeToast(true)
  }

  return (
    <div className="flex w-full flex-row items-center">
      <div className="flex flex-1 pr-4">{data.title}</div>
      <button
        type="button"
        onClick={handleUndo}
        className={clsx("inline-block rounded border-2 px-2 py-1 text-tiny", {
          "border-gray-400 text-gray-400": !data.color,
          "border-red-400 text-red-400": data.color === "red",
        })}
      >
        <div className="flex items-center justify-center">
          {data.undoText || "Undo"}
        </div>
      </button>
    </div>
  )
}
