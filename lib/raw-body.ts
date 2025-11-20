
import { NextApiRequest } from 'next'
import getRawBody from 'raw-body'

export async function getRawBodyFromRequest(req: NextApiRequest): Promise<Buffer> {
    const buffer = await getRawBody(req)
    return buffer
}
