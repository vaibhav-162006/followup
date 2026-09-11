import { Prisma } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { HttpError, serializeActivity, serializeLead } from "../lib/http.js";

const leadStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "FOLLOW_UP",
  "WON",
  "LOST",
]);

const leadSourceSchema = z.enum(["WHATSAPP", "MANUAL", "OTHER"]);

const createLeadSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(5),
  email: z.string().trim().email().optional(),
  notes: z.string().trim().optional(),
  source: leadSourceSchema.optional(),
});

const updateLeadSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    phone: z.string().trim().min(5).optional(),
    email: z.string().trim().email().nullable().optional(),
    notes: z.string().trim().nullable().optional(),
    status: leadStatusSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

const listLeadsQuerySchema = z.object({
  status: leadStatusSchema.optional(),
});

const createNoteSchema = z.object({
  body: z.string().trim().min(1),
});

async function getDemoBusinessId(app: FastifyInstance) {
  const business = await app.prisma.business.findUnique({
    where: { slug: "demo" },
  });

  if (!business) {
    throw new HttpError(
      503,
      "Demo business is missing. Run `pnpm --filter @followup/api db:seed`.",
    );
  }

  return business.id;
}

export async function leadRoutes(app: FastifyInstance) {
  app.get("/leads", async (request) => {
    const query = listLeadsQuerySchema.parse(request.query);
    const businessId = await getDemoBusinessId(app);

    const leads = await app.prisma.lead.findMany({
      where: {
        businessId,
        ...(query.status ? { status: query.status } : {}),
      },
      orderBy: { updatedAt: "desc" },
    });

    return { leads: leads.map(serializeLead) };
  });

  app.post("/leads", async (request, reply) => {
    const body = createLeadSchema.parse(request.body);
    const businessId = await getDemoBusinessId(app);

    try {
      const lead = await app.prisma.lead.create({
        data: {
          businessId,
          name: body.name,
          phone: body.phone,
          email: body.email,
          notes: body.notes,
          source: body.source ?? "MANUAL",
          activities: {
            create: {
              type: "CREATED",
              body: "Lead created.",
            },
          },
        },
      });

      return reply.code(201).send({ lead: serializeLead(lead) });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new HttpError(409, "A lead with this phone already exists.");
      }
      throw error;
    }
  });

  app.get("/leads/:id", async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const businessId = await getDemoBusinessId(app);

    const lead = await app.prisma.lead.findFirst({
      where: { id, businessId },
      include: { activities: { orderBy: { createdAt: "asc" } } },
    });

    if (!lead) {
      throw new HttpError(404, "Lead not found.");
    }

    return {
      lead: serializeLead(lead),
      activities: lead.activities.map(serializeActivity),
    };
  });

  app.patch("/leads/:id", async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = updateLeadSchema.parse(request.body);
    const businessId = await getDemoBusinessId(app);

    const current = await app.prisma.lead.findFirst({
      where: { id, businessId },
    });

    if (!current) {
      throw new HttpError(404, "Lead not found.");
    }

    try {
      const lead = await app.prisma.$transaction(async (tx) => {
        const updated = await tx.lead.update({
          where: { id },
          data: {
            name: body.name,
            phone: body.phone,
            email: body.email,
            notes: body.notes,
            status: body.status,
            lastContactedAt:
              body.status && body.status !== current.status
                ? new Date()
                : undefined,
          },
        });

        if (body.status && body.status !== current.status) {
          await tx.leadActivity.create({
            data: {
              leadId: id,
              type: "STATUS_CHANGE",
              body: `Status changed from ${current.status} to ${body.status}.`,
            },
          });
        }

        return updated;
      });

      return { lead: serializeLead(lead) };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new HttpError(409, "A lead with this phone already exists.");
      }
      throw error;
    }
  });

  app.delete("/leads/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const businessId = await getDemoBusinessId(app);

    const lead = await app.prisma.lead.findFirst({
      where: { id, businessId },
    });

    if (!lead) {
      throw new HttpError(404, "Lead not found.");
    }

    await app.prisma.lead.delete({ where: { id } });
    return reply.code(204).send();
  });

  app.post("/leads/:id/activities", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = createNoteSchema.parse(request.body);
    const businessId = await getDemoBusinessId(app);

    const lead = await app.prisma.lead.findFirst({
      where: { id, businessId },
    });

    if (!lead) {
      throw new HttpError(404, "Lead not found.");
    }

    const activity = await app.prisma.leadActivity.create({
      data: {
        leadId: id,
        type: "NOTE",
        body: body.body,
      },
    });

    return reply.code(201).send({ activity: serializeActivity(activity) });
  });
}
