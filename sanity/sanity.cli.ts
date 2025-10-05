import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'tirssn7e',
    dataset: 'production'
  },
  deployment: {
    appId: 'x9t2iascavp2k8pxr163et4l',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/cli#auto-updates
     */
    autoUpdates: true,
  }
})
