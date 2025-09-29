import { db } from "~/database"
import { events } from "~/database/schema"
import { and, gte, lte } from "drizzle-orm"
import { getCategoryColor } from "./events.utils"

export const eventsGET = async ({ request }: { request: Request }) => {
  console.log('API Events GET called')

  try {
    // Récupérer les paramètres de date depuis l'URL
    const url = new URL(request.url)
    const startDate = url.searchParams.get('start')
    const endDate = url.searchParams.get('end')

    console.log('Date range requested:', { startDate, endDate })

    // Construire et exécuter la requête avec filtres de date
    let dbEvents

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)

      dbEvents = await db.select().from(events).where(
        and(
          gte(events.startDate, start),
          lte(events.startDate, end)
        )
      )
    } else {
      dbEvents = await db.select().from(events)
    }

    console.log(`Found ${dbEvents.length} events in database`)

    // Transformer les événements de la DB vers le format attendu par le frontend
    const formattedEvents = dbEvents.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      category: event.category,
      status: event.status,
      allowedRoles: event.allowedRoles ? JSON.parse(event.allowedRoles) : [],
      isConfidential: Boolean(event.isConfidential),
      color: getCategoryColor(event.category)
    }))

    return Response.json(formattedEvents)

  } catch (error) {
    console.error('Error fetching events:', error)
    return Response.json(
      { error: 'Erreur lors de la récupération des événements' },
      { status: 500 }
    )
  }
}