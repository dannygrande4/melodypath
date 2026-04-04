import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_db'
import { getUserId } from '../_auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const userId = await getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const { lesson_id, score } = req.body ?? {}
  if (!lesson_id) return res.status(400).json({ error: 'lesson_id required' })

  const progress = await prisma.lessonProgress.upsert({
    where: { user_id_lesson_id: { user_id: userId, lesson_id } },
    create: {
      user_id: userId,
      lesson_id,
      completed: true,
      score: score ?? null,
      attempts: 1,
      completed_at: new Date(),
    },
    update: {
      completed: true,
      score: score ?? undefined,
      attempts: { increment: 1 },
      completed_at: new Date(),
    },
  })

  res.json({ data: progress })
}
