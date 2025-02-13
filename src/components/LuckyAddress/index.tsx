import React from "react"

import SourceCodePart from "./SourceCodePart"
import Console from "./Console"
import LuckySetting from "./LuckySetting"
import CheckLuckAddressDialog from "@/components/LuckyAddressDialog/CheckLuckAddressDialog"
import DeployContractDialog from "@/components/LuckyAddressDialog/DeployContractDialog"
import { IProjectType } from "./types"

// components
import ProjectSelector from "./ProjectSelector"
import LogTable from "./LogTable"

// hooks
import { useConsole } from "./hooks/useConsole"
import { useLuckySetting } from "./hooks/useLuckySetting"
import { useLuckyAddress } from "./hooks/useLuckyAddress"
import { useProjectSelector } from "./hooks/useProjectSelector"
import { useDeployAddress } from "./hooks/useDeployContract"
// import { useWorkers } from "./hooks/useWorkers"
const LuckyAddress = () => {
  const { output, log } = useConsole()

  const {
    inputText,
    onInputChange,
    projects,
    createNewProject,
    inputInProjects,
    deleteProject,
    onSelectProject,
    curProjectTitle,
    saveProject2localStorage,
    loadProjectFromLocalStorage,
  } = useProjectSelector(log)

  const {
    codeType,
    forkEnv,
    solcVersion,
    optimize,
    onCodeTypeChange,
    onCodeChange,
    onForkEnvChange,
    onSolcVersionChange,
    onOptimizeChange,
    code,
    genByteCode,
    compiling,
    isValidSolidityCode,
    contractByteCode,
    luckyNumberText,
    onLuckNumberTextChange,
    allowDynamicConstructorParams,
    constructorParams,
    onConstructorParamsAppend,
    onConstructorParamsDelect,
    onConstructorParamsChange,
    save2LuckySetting,
    factoryAddress,
    workerProcess,
    onWorkerProcessChange,
    refreshFactoryAddress,
  } = useLuckySetting(log)

  const {
    finalByteCode,
    validLuckMatchers,
    isOpenCheckModal,
    isComputing,
    openCheckModal,
    closeCheckModal,
    save2LuckAddress,
    startSearch,
    stopSearch,
    onSetForceRecreate,
    forceRecreate,
    uniqueIdSameToCache,
    luckyAddressSaltLogs,
  } = useLuckyAddress(log, workerProcess)

  const {
    isDeploying,
    openDeployModal,
    onOpenDeployModal,
    onCloseDeployModal,
    selectSaltAddress,
    estimateGas,
    gasPrice,
    estimateWei,
    onDeploy,
  } = useDeployAddress(log, factoryAddress, finalByteCode)

  const save2Storage = () => {
    const data: IProjectType = {
      optimize,
      codeType,
      solcVersion,
      forkEnv,
      code,
      contractByteCode,
      // luckySetting
      luckyNumberText,
      allowDynamicConstructorParams,
      constructorParams,
      // luckAddress
      finalByteCode,
      validLuckMatchers,
      isValidSolidityCode,
      factoryAddress,
      workerProcess: [...workerProcess],
    }
    saveProject2localStorage(curProjectTitle, data)
  }

  const loadFromStorage = (_projectTitle: string) => {
    const data = loadProjectFromLocalStorage(_projectTitle)
    if (data) {
      save2LuckySetting(data)
      save2LuckAddress(data)
    }
  }

  return (
    <div className="rounded-lg bg-gray-100 outline-gray-300 dark:bg-black-700 dark:outline-gray-600">
      <div className="flex flex-col md:flex-row">
        <ProjectSelector
          isComputing={isComputing}
          inputText={inputText}
          onInputChange={onInputChange}
          projects={projects}
          createNewProject={createNewProject}
          inputInProjects={inputInProjects}
          deleteProject={deleteProject}
          onSelectProject={onSelectProject}
          curProjectTitle={curProjectTitle}
          onSave={save2Storage}
          loadFromStorage={loadFromStorage}
        />
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2">
          <SourceCodePart
            isComputing={isComputing}
            codeType={codeType}
            onCodeTypeChange={onCodeTypeChange}
            solcVersion={solcVersion}
            onSolcVersionChange={onSolcVersionChange}
            forkEnv={forkEnv}
            onForkEnvChange={onForkEnvChange}
            goNext={() => {
              genByteCode(code, codeType, solcVersion, forkEnv)
            }}
            code={code}
            onCodeChange={onCodeChange}
            optimize={optimize}
            onOptimizeChange={onOptimizeChange}
            compiling={compiling}
            isValidSolidityCode={isValidSolidityCode}
          />
        </div>

        <div className="border-black-300 dark:bg-black-300 w-full border-t-2 md:w-1/2 md:border-t-0 md:bg-transparent">
          <div className="flex h-14 items-center pl-4 pr-6">
            <h3 className="text-md items-center font-semibold">
              <span>Lucky Setting</span>
            </h3>
          </div>

          <div className="pane pane-light h-full overflow-auto bg-gray-50 dark:bg-black-600">
            <LuckySetting
              isComputing={isComputing}
              curProjectTitle={curProjectTitle}
              bytecode={contractByteCode}
              onLuckyNumberTextChange={onLuckNumberTextChange}
              luckyNumberText={luckyNumberText}
              allowDynamicConstructorParams={allowDynamicConstructorParams}
              constructorParams={constructorParams}
              factoryAddress={factoryAddress}
              workerProcess={workerProcess}
              onWorkerProcessChange={onWorkerProcessChange}
              onConstructorParamsChange={onConstructorParamsChange}
              onConstructorParamsAppend={onConstructorParamsAppend}
              onConstructorParamsDelect={onConstructorParamsDelect}
              refreshFactoryAddress={refreshFactoryAddress}
              submit={openCheckModal}
              stopSearch={stopSearch}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row-reverse">
        <div className="w-full md:w-1/2">
          <div
            className="pane pane-dark overflow-auto border-black-900/25 bg-gray-800 px-4 pb-1 text-white dark:bg-black-700"
            style={{ height: 350 }}
          >
            <LogTable
              logs={luckyAddressSaltLogs}
              matchers={validLuckMatchers}
              onOpenDeployModal={onOpenDeployModal}
            />
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div className="overflow-auto">
            <div
              className="pane pane-dark overflow-auto border-t border-black-900/25 bg-gray-800 text-white dark:bg-black-700 md:border-r"
              style={{ height: 350 }}
            >
              <Console output={output} />
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-b-lg border-t border-black-900/25 bg-gray-800 px-4 py-2 text-xs text-gray-400 dark:bg-black-700 dark:text-gray-600">
        Luck Address Generator {process.env.NEXT_PUBLIC_APP_VERSION} --{" "}
        {process.env.NEXT_PUBLIC_GITHUB_REPO_URL}
      </div>
      <CheckLuckAddressDialog
        open={isOpenCheckModal}
        onClose={closeCheckModal}
        bytecode={finalByteCode}
        validLuckMatchers={validLuckMatchers}
        factoryAddress={factoryAddress}
        forceRecreate={forceRecreate}
        uniqueIdSameToCache={uniqueIdSameToCache}
        onSetForceRecreate={onSetForceRecreate}
        startGen={() => {
          startSearch(curProjectTitle)
        }}
      />
      <DeployContractDialog
        isDeploying={isDeploying}
        open={openDeployModal}
        onClose={onCloseDeployModal}
        onDeploy={onDeploy}
        factoryAddress={factoryAddress}
        deploySalt={selectSaltAddress.salt}
        deployAddress={selectSaltAddress.address}
        estimateGas={estimateGas}
        gasPrice={gasPrice}
        estimateWei={estimateWei}
      />
    </div>
  )
}

export default LuckyAddress
