import clsx from "clsx"
import { useTranslation } from "next-i18next"
import Autocomplete from "@mui/material/Autocomplete"

import { Button, Icon } from "@/components/ui"

type ProjectSelectorProps = {
  isComputing: boolean
  inputText: string
  onInputChange: (value: string) => void
  projects: string[]
  createNewProject: (projectName: string) => void
  inputInProjects: boolean
  deleteProject: (projectName: string) => void
  onSelectProject: (projectName: string) => void
  curProjectTitle: string
  onSave: () => void
  loadFromStorage: (_title: string) => void
}
const ProjectSelector = ({
  isComputing = false,
  inputText = "",
  onInputChange,
  projects = [],
  createNewProject,
  inputInProjects,
  deleteProject,
  onSelectProject,
  curProjectTitle,
  onSave,
  loadFromStorage,
}: ProjectSelectorProps) => {
  const { t } = useTranslation("common")
  return (
    <div className="flex w-full flex-col gap-2 border-b border-gray-200 px-4 py-3 dark:border-black-500 md:flex-row">
      <div className="flex flex-1 flex-col">
        <Autocomplete
          className="w-full"
          size="small"
          freeSolo
          disabled={isComputing}
          value={curProjectTitle}
          options={projects}
          getOptionLabel={(option) => option}
          onChange={(_, newValue) => {
            if (newValue) {
              //   console.log("newValue:", newValue)
              onInputChange(newValue)
              onSelectProject(newValue)
              loadFromStorage(newValue)
            }
          }}
          renderInput={(params) => (
            <div ref={params.InputProps.ref}>
              <input
                type="text"
                {...params.inputProps}
                value={inputText}
                onChange={(e) => {
                  onInputChange(e.target.value)
                }}
                className="w-full rounded-md border-0 bg-white px-2 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 dark:bg-black-700 dark:text-white dark:ring-gray-600 sm:text-sm sm:leading-6"
              />
            </div>
          )}
        />
      </div>

      <div className="flex flex-row justify-end gap-2">
        <Button
          type="button"
          onClick={() => {
            createNewProject(inputText)
          }}
          size="sm"
          contentClassName="justify-center"
          className={clsx(
            "justify-center bg-green-500 hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600",
            {
              hidden: inputInProjects || !inputText,
            },
          )}
          disabled={inputInProjects || !inputText || isComputing}
        >
          <Icon name="add-line" className="text-white-600 dark:text-gray-200" />
          <span className="px-1">{t("action.Create")}</span>
        </Button>

        <Button
          type="button"
          onClick={() => loadFromStorage(inputText)}
          size="sm"
          contentClassName="justify-center"
          className={clsx(
            "justify-center bg-pink-500 hover:bg-pink-600 dark:bg-pink-500 dark:hover:bg-pink-600",
          )}
          disabled={!inputInProjects || isComputing}
        >
          <Icon
            name="import-line"
            className="text-white-600 dark:text-gray-200"
          />
          <span className="px-1"> {t("action.Load")} </span>
        </Button>

        <Button
          type="button"
          onClick={onSave}
          size="sm"
          contentClassName="justify-center"
          className={clsx(
            "justify-center bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600",
            {
              hidden: !inputInProjects,
            },
          )}
          disabled={!inputInProjects || isComputing}
        >
          <Icon
            name="save-line"
            className="text-white-600 dark:text-gray-200"
          />
          <span className="px-1">{t("action.Save")}</span>
        </Button>

        <Button
          type="button"
          onClick={() => {
            deleteProject(inputText)
          }}
          size="sm"
          contentClassName="justify-center"
          className={clsx(
            "justify-center bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600",
            {
              hidden: !inputInProjects,
            },
          )}
          disabled={!inputInProjects || isComputing}
        >
          <Icon
            name="delete-bin-2-line"
            className="text-white-600 dark:text-gray-200"
          />
          <span className="px-1"> {t("action.Delete")}</span>
        </Button>
      </div>
    </div>
  )
}

export default ProjectSelector
