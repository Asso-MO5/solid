import { getSession } from "@solid-mediakit/auth";
import { authOptions } from "../auth/auth.api";
import { db } from "~/database";
import { events } from "~/database/schema";
import { nanoid } from "nanoid";
import { getCategoryColor } from "./events.utils";

export const eventsPOST = async ({ request }: { request: Request }) => {

  const session = await getSession(request, authOptions)
  if (!session) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  if (!session.user?.roles?.admin || !session.user?.roles?.video) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()

    // Validation basique
    if (!body.title || !body.startDate || !body.endDate) {
      return Response.json(
        { error: 'Titre, date de début et date de fin sont requis' },
        { status: 400 }
      )
    }

    // Créer l'événement en base de données
    const eventId = nanoid()

    const newEventData = {
      id: eventId,
      title: body.title,
      description: body.description || null,
      slug: eventId, // Utiliser l'ID comme slug
      publicTitle: body.title, // Par défaut, même titre
      publicDescription: body.description || null,
      publicVisible: 0, // Par défaut, pas visible publiquement
      category: body.category || 'other',
      status: body.status || 'draft',
      allowedRoles: body.allowedRoles ? JSON.stringify(body.allowedRoles) : null,
      allowedMembers: null, // Pas utilisé pour l'instant
      isConfidential: body.isConfidential ? 1 : 0,
      organizerId: session.user.id || 'unknown', // L'utilisateur connecté est l'organisateur
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      registrationStart: null, // Pas de gestion d'inscription pour l'instant
      registrationEnd: null,
      maxCapacity: null,
      minCapacity: null,
      externalUrl: null,
      externalName: null,
      plan: null,
      internalNotes: null
    }

    // Insérer en base de données
    await db.insert(events).values(newEventData)

    // Retourner l'événement avec la couleur pour l'affichage
    const newEvent = {
      ...newEventData,
      color: getCategoryColor(body.category || 'other'),
      allowedRoles: body.allowedRoles || []
    }


    return Response.json(newEvent, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return Response.json(
      { error: 'Erreur lors de la création de l\'événement' },
      { status: 500 }
    )
  }
}

