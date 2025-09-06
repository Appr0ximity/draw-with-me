import z from "zod";

export const roomSchema = z.object({
    roomPassword: z.string().min(4, "Room password should be at least 4 characters")
})

export type RoomPass = z.infer<typeof roomSchema>