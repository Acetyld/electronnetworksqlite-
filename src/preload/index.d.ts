import { ElectronAPI } from '@electron-toolkit/preload'
import { User } from "../main/entity/User";

declare global {
  interface Api {
    addUser: () => Promise<User>;
    setupDatabase: () => Promise<void>;
  }
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
