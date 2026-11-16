"use server";

import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session-token";
import { AdminError, createCategory, updateCategory, deleteCategory, deleteUser, verifyCurator } from "@/lib/admin";
import { removeUploads } from "@/lib/uploads";
import { textField } from "@/lib/validation";

function actionError(error, values = {}) {
  if (error instanceof AdminError) return { success: false, message: error.message, fields: error.fields, values };
  console.error("Operasi Admin gagal:", error.code || "ADMIN_ERROR");
  return { success: false, message: "Perubahan belum dapat disimpan. Coba kembali.", fields: {}, values };
}

async function adminToken() {
  await requireUser({ roles: ["admin"] });
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

function saved(redirectTo) {
  return { success: true, message: "", fields: {}, values: {}, redirectTo };
}

export async function saveCategoryAction(previous, form) {
  const token = await adminToken();
  const id = textField(form, "id");
  const values = { name: textField(form, "name"), description: textField(form, "description") };
  try {
    if (id) await updateCategory(token, id, values);
    else await createCategory(token, values);
  } catch (error) { return actionError(error, values); }
  return saved("/dashboard/admin/categories?notice=" + (id ? "updated" : "created"));
}

export async function deleteCategoryAction(previous, form) {
  const token = await adminToken();
  try {
    await deleteCategory(token, textField(form, "id"), textField(form, "confirmation"));
  } catch (error) { return actionError(error); }
  return saved("/dashboard/admin/categories?notice=deleted");
}

export async function deleteUserAction(previous, form) {
  const token = await adminToken();
  let result;
  try {
    result = await deleteUser(token, textField(form, "id"), textField(form, "confirmationEmail"));
  } catch (error) { return actionError(error); }
  const failedFiles = await removeUploads(result.files);
  const role = textField(form, "returnRole");
  const params = new URLSearchParams({ notice: failedFiles ? "deleted-files" : "deleted" });
  if (["admin", "member", "curator"].includes(role)) params.set("role", role);
  return saved("/dashboard/admin/users?" + params.toString());
}

export async function verifyCuratorAction(previous, form) {
  const token = await adminToken();
  const values = { reason: textField(form, "reason") };
  const decision = textField(form, "decision");
  try {
    await verifyCurator(token, textField(form, "id"), decision, values.reason);
  } catch (error) { return actionError(error, values); }
  return saved("/dashboard/admin/curators?notice=" + decision);
}

