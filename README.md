# Azure Pipelines Fortify CLI (fcli) Tasks

This extension includes various Azure Pipelines Tasks for integrating with the Fortify CLI (fcli) tool.

It currently includes tasks for the following:

 - Installing the Fortify CLI tool -  [fcli](https://github.com/fortify/fcli)

Please note: this extension is not supported by Opentext in any way - use of at your own risk.

This extension is currently not published to the public marketplace so you will need to use the following
instructions to build and publish it privately.

### Building the extension

#### Prerequisites

See [here](https://learn.microsoft.com/en-us/azure/devops/extend/develop/add-build-task?view=azure-devops) for the software and tools you will need to build the extension.

#### Build and Install

Carry out the following from the top level of the project:

```agsl
npm install
npm run build
npm run package
```

A file will be created called **fortify-presales.azure-pipelines-fcli-tasks-x.x.x.vsix**.

#### Installing the Extension

To install the extension:

 - Navigate to the relevant Visual Studio Marketplace for your organisation, e.g. [https://marketplace.visualstudio.com/manage/publishers/your-organisation](https://marketplace.visualstudio.com/manage/publishers/your-organisation).
 - Click on **New Extension->Azure DevOps** and upload the 'vsix' file from above
 - Once the extension has been validated, then 'share' it with your desired organisation(s).
 - Finally, within the organisation(s) navigate to extensions and install it.
