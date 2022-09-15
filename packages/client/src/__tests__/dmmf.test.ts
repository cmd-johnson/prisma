import { serializeQueryEngineName } from '@prisma/internals'
import stripAnsi from 'strip-ansi'

import { getDMMF } from '../generation/getDMMF'

describe('dmmf', () => {
  test('dmmf enum filter mysql', async () => {
    const datamodel = `
      datasource db {
        provider = "mysql"
        url      = env("MY_MYSQL_DB")
      }
      
      model User {
        id Int @id @default(autoincrement())
        name String
        email String @unique
        kind PostKind
      }
      
      enum PostKind {
        NICE
        AWESOME
      }`

    const dmmf = await getDMMF({ datamodel })
    expect(
      dmmf.schema.inputObjectTypes.prisma.find((i) => i.name === 'NestedEnumPostKindFilter'),
    ).toMatchInlineSnapshot(`undefined`)
    expect(dmmf.schema.inputObjectTypes.prisma.find((i) => i.name === 'EnumPostKindFilter')).toMatchInlineSnapshot(
      `undefined`,
    )
  })

  test('dmmf enum filter postgresql', async () => {
    const datamodel = `
      datasource db {
        provider = "postgresql"
        url      = env("MY_POSTGRES_DB")
      }
      
      model User {
        id Int @id @default(autoincrement())
        name String
        email String @unique
        kind PostKind
      }
      
      enum PostKind {
        NICE
        AWESOME
      }`

    const dmmf = await getDMMF({ datamodel })
    expect(
      dmmf.schema.inputObjectTypes.prisma.find((i) => i.name === 'NestedEnumPostKindFilter'),
    ).toMatchInlineSnapshot(`undefined`)
    expect(dmmf.schema.inputObjectTypes.prisma.find((i) => i.name === 'EnumPostKindFilter')).toMatchInlineSnapshot(
      `undefined`,
    )
  })

  test('dmmf enum should fail on sqlite', async () => {
    const datamodel = `
      datasource db {
        provider = "sqlite"
        url      = "file:./dev.db"
      }

      model User {
        id Int @id @default(autoincrement())
        name String
        email String @unique
        kind PostKind
      }

      enum PostKind {
        NICE
        AWESOME
      }`

    try {
      await getDMMF({ datamodel })
    } catch (e) {
      expect(serializeQueryEngineName(stripAnsi(e.message))).toMatchInlineSnapshot(`
        Schema validation error - Error (query-engine-NORMALIZED)
        Error code: P1012
        error: Error validating: You defined the enum \`PostKind\`. But the current connector does not support enums.
          -->  schema.prisma:14
           | 
        13 | 
        14 |       enum PostKind {
        15 |         NICE
        16 |         AWESOME
        17 |       }
           | 

        Validation Error Count: 1
        [Context: getDmmf]

        Prisma CLI Version : 0.0.0
      `)
    }
  })
})
