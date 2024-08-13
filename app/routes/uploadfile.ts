import {
  ActionFunction,
  redirect,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";

export const action: ActionFunction = async ({ request, params }) => {
  try {
    const searchParams = new URL(request.url).searchParams;
    const appId = searchParams.get("appId");
    console.log("appId", appId);
    const path = `public/uploads/${appId}`;

    const uploadHandler = unstable_composeUploadHandlers(
      unstable_createFileUploadHandler({
        directory: path,
        file: ({ filename }) => filename,
      }),
      unstable_createMemoryUploadHandler()
    );

    const formData = await unstable_parseMultipartFormData(
      request,
      uploadHandler
    );

    console.log("Upload Action", formData);

    return redirect("/manage-apps");
  } catch (e) {
    console.log(e);
    return redirect("/manage-apps");
  }
};
