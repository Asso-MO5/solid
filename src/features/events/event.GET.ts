import { getSession } from "@solid-mediakit/auth"
import { authOptions } from "~/features/auth/auth.api"
import { db } from "~/database"
import { events } from "~/database/schema"
import { eq } from "drizzle-orm"
import { getCategoryColor } from "./events.utils"

export const eventIdGET = async ({ request, params }: { request: Request, params: { id: string } }) => {
  const session = await getSession(request, authOptions)
  if (!session) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const eventId = params.id

    // Récupérer l'événement depuis la base de données
    const dbEvent = await db.select().from(events).where(eq(events.id, eventId)).limit(1)

    if (dbEvent.length === 0) {
      return Response.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    const event = dbEvent[0]

    // Vérifier les droits d'accès
    const userRoles = session.user?.roles as Record<string, boolean> || {}

    // Si l'événement est confidentiel, seuls les admins peuvent le voir
    if (event.isConfidential && !userRoles.admin) {
      return Response.json(
        { error: 'Accès refusé - Événement confidentiel' },
        { status: 403 }
      )
    }

    // Vérifier les rôles autorisés si l'événement a des restrictions
    if (event.allowedRoles) {
      const allowedRoles = JSON.parse(event.allowedRoles)
      if (allowedRoles.length > 0) {
        const hasAccess = allowedRoles.some((role: string) => userRoles[role])
        if (!hasAccess && !userRoles.admin) {
          return Response.json(
            { error: 'Accès refusé - Rôles insuffisants' },
            { status: 403 }
          )
        }
      }
    }

    // Transformer l'événement vers le format attendu par le frontend
    const formattedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      category: event.category,
      status: event.status,
      allowedRoles: event.allowedRoles ? JSON.parse(event.allowedRoles) : [],
      isConfidential: Boolean(event.isConfidential),
      color: getCategoryColor(event.category),
      organizerId: event.organizerId,
      publicTitle: event.publicTitle,
      publicDescription: event.publicDescription,
      publicVisible: Boolean(event.publicVisible),
      registrationStart: event.registrationStart ? new Date(event.registrationStart) : null,
      registrationEnd: event.registrationEnd ? new Date(event.registrationEnd) : null,
      maxCapacity: event.maxCapacity,
      minCapacity: event.minCapacity,
      externalUrl: event.externalUrl,
      externalName: event.externalName,
      plan: event.plan,
      internalNotes: event.internalNotes
    }

    return Response.json(formattedEvent)

  } catch (error) {
    console.error('Error fetching event:', error)
    return Response.json(
      { error: 'Erreur lors de la récupération de l\'événement' },
      { status: 500 }
    )
  }
}
