import { BASE_URL } from "./index";
import axios from "axios";
import type { FileUploadResponse } from "../types";

export default async function uploadFile(
  file: File,
): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axios.post<FileUploadResponse>(
    BASE_URL + "/file-upload/verify",
    formData,
  );
  return data;
}
