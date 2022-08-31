import { getTestClient } from '../../../../utils/getTestClient'

describe('connection-limit-postgres', () => {
  const clients: any[] = []

  afterAll(async () => {
    await Promise.all(clients.map((c) => c.$disconnect()))
  })

  test('the client cannot query the db with 100 connections already open', async () => {
    expect.assertions(1)
    const PrismaClient = await getTestClient()

    for (let i = 0; i <= 100; i++) {
      const client = new PrismaClient({
        datasources: {
          db: { url: process.env.TEST_POSTGRES_ISOLATED_URI },
        },
      })
      clients.push(client)
    }

    try {
      for (const client of clients) {
        await client.$connect()
      }
    } catch (e) {
      expect(e.message).toMatch('Error querying the database: db error: FATAL: sorry, too many clients already')
    }
  }, 100_000)
})
