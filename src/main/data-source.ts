import { DataSource } from 'typeorm'
import { User } from './entity/User'
import { store } from './store'

export let dataSource: DataSource | null
export const initDataSource = async ({
  database,
  synchronize
}: {
  database: string
  synchronize: boolean
}): Promise<DataSource> =>
  new DataSource({
    type: 'sqlite',
    database,
    synchronize,
    logging: true,
    entities: [User],
    migrations: [],
    subscribers: []
  })

export const setupDataSource = async (): Promise<void> => {
  const databasePath = store.get('databasePath') as string
  dataSource = await initDataSource({
    database: databasePath,
    synchronize: true
  })
  await dataSource.initialize()
}

export const destroyDataSource = async (): Promise<void> => {
  if (!dataSource) return
  await dataSource.destroy()
  dataSource = null
}
