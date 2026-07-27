import api from "@/lib/api";
import { Appointment, AppointmentStatus } from "@/types";

export interface AppointmentBookingPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  purpose?: string;
  message?: string;
  appointmentDate: string;
  appointmentTime: string;
}

/** Public: fetch open slots for a given date (YYYY-MM-DD). */
export const getAvailability = async (date: string): Promise<string[]> => {
  const response = await api.get("/public/appointments/availability", { params: { date } });
  return response.data.availableSlots;
};

/** Public: submit a booking request (lands as PENDING, pending admin approval). */
export const bookAppointment = async (payload: AppointmentBookingPayload) => {
  const response = await api.post("/public/appointments", payload);
  return response.data;
};

/** Admin: full listing, newest first. */
export const getAdminAppointments = async (): Promise<Appointment[]> => {
  const response = await api.get("/appointments/admin/all");
  return response.data;
};

export const updateAppointmentStatus = async (id: number, status: AppointmentStatus) => {
  const response = await api.patch(`/appointments/${id}/status`, { status });
  return response.data;
};

export const deleteAppointment = async (id: number) => {
  return api.delete(`/appointments/${id}`);
};

export const bulkDeleteAppointments = async (ids: number[]) => {
  const response = await api.post("/appointments/bulk-delete", { ids });
  return response.data;
};

export const bulkUpdateAppointmentStatus = async (ids: number[], status: AppointmentStatus) => {
  const response = await api.patch("/appointments/bulk-status", { ids, status });
  return response.data;
};
