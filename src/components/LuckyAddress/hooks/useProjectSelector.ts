import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { useTranslation } from "next-i18next"
import { UndoNotification } from "@/components/ui"
import { useStorage } from "@/hooks/useStorage"
import {
  cacheExist,
  loadStorageData,
  save2StorageData,
  deleteStorageData,
} from "@/util/storage"
import { GenWorkersManager } from "@/core/GenWorkersManager"
import { PROJECT_LIST_KEY, PROJECT_PREFIX } from "@/util/constants"
import { IProjectType, initProject, IConsoleOutput } from "../types"

// interface ProjectList

function genCacheProjectKey(projectTitle: string) {
  return `${PROJECT_PREFIX}${projectTitle}`
}

export function useProjectSelector(
  log: (msg: any, type?: IConsoleOutput["type"]) => void,
) {
  const [projects, setProjects] = useStorage<string[]>(PROJECT_LIST_KEY, [])
  const [inputText, setInputText] = useState<string>("")
  const [curProjectTitle, setCurProjectTitle] = useState<string>("")
  const [inputInProjects, setInputInProjects] = useState<boolean>(false)

  const { t } = useTranslation("common")

  function createNewProject(projetTitle: string) {
    log(`create project: ${projetTitle}`)
    setProjects((prev: string[]) => {
      const next = [...prev]
      if (!next.includes(projetTitle)) {
        next.push(projetTitle)
      }

      return next
    })
    setCurProjectTitle(projetTitle)
  }

  function deleteProject(projectTitle: string) {
    let undo = false
    toast.info(UndoNotification, {
      position: "top-right",
      //   autoClose: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      closeButton: true,
      onClose: () => {
        if (undo) {
          return
        }
        setProjects((prev: string[]) =>
          prev.filter((name) => name !== projectTitle),
        )

        deleteStorageData(genCacheProjectKey(projectTitle))
        const workerKey = GenWorkersManager.genCacheKey(projectTitle)
        deleteStorageData(workerKey)
        log(`delete project: ${projectTitle}`)
        setCurProjectTitle("")
        setInputText("")
      },
      data: {
        // 确认删除
        title: t("Confirm_Delete", { name: projectTitle }),
        onUndo: () => {
          undo = true
        },
      },
    })
  }

  function onSelectProject(projectTitle: string) {
    setCurProjectTitle(projectTitle)
  }

  useEffect(() => {
    setInputInProjects(projects.includes(inputText))
  }, [projects, inputText])

  function saveProject2localStorage(projectTitle: string, data: IProjectType) {
    const key = genCacheProjectKey(projectTitle)
    log(`save project: ${projectTitle} to localStorage`)
    save2StorageData(key, data)
  }

  function loadProjectFromLocalStorage(
    projectTitle: string,
  ): IProjectType | undefined {
    const key = genCacheProjectKey(projectTitle)
    if (!cacheExist(key)) {
      return undefined
    }
    const data = loadStorageData<IProjectType>(key, initProject)
    log(`load project: ${projectTitle} from localStorage`)
    return data
  }

  return {
    inputText,
    onInputChange: setInputText,
    projects,
    inputInProjects,
    curProjectTitle,
    createNewProject,
    deleteProject,
    onSelectProject,
    saveProject2localStorage,
    loadProjectFromLocalStorage,
  }
}
