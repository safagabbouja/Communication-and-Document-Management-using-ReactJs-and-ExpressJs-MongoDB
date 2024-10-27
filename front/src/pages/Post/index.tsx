import { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import Button from "../../base-components/Button";
import { FormInput, FormLabel } from "../../base-components/Form";
import clsx from "clsx";

function Main() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [folderName, setFolderName] = useState("");
  const [folders, setFolders] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState("");
  const [pdfs, setPdfs] = useState<{ id: number; name: string; url: string }[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/folders")
      .then(response => response.json())
      .then(data => setFolders(data))
      .catch(error => console.error("Error fetching folders:", error));
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const createFolder = () => {
    if (!folderName) return;

    fetch("http://localhost:5000/create-folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderName }),
    })
      .then(response => response.text())
      .then(() => {
        setFolders([...folders, folderName]);
        setFolderName("");
      })
      .catch(error => {
        console.error("Error creating folder:", error);
      });
  };

  const onUpload = () => {
    if (selectedFiles.length === 0 || !currentFolder) return;

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append("pdfs", file));
    formData.append("folder", currentFolder);

    fetch("http://localhost:5000/upload/multiple", {
      method: "POST",
      body: formData,
    })
      .then(response => response.json())
      .then(({ folder, files }) => {
        setPdfs([...pdfs, ...files]);
        setSelectedFiles([]);
      

        loadFiles(folder);
      })
      .catch(error => {
        console.error("Error uploading files:", error);
      });
  };

  const loadFiles = (folder: string) => {
    setCurrentFolder(folder);
    fetch(`http://localhost:5000/files/${folder}`)
      .then(response => response.json())
      .then(data => setPdfs(data))
      .catch(error => console.error("Error fetching files:", error));
  };

  return (
    <div>
      <div className="flex flex-col items-center mt-8 sm:flex-row">
        <h2 className="mr-auto text-lg font-medium">Manage PDFs</h2>
      </div>
      <div className="grid grid-cols-12 gap-5 mt-5">
        <div className="col-span-12 lg:col-span-8">
          <FormInput
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="px-4 py-3 pr-10 !box"
            placeholder="New Folder Name"
          />
          <Button onClick={createFolder} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md">
            Create Folder
          </Button>
          <div className="mt-5">
            <h3 className="text-lg font-medium">Folders</h3>
            <div className="mt-2">
              {folders.map((folder) => (
                <Button
                  key={folder}
                  onClick={() => loadFiles(folder)}
                  className="mr-2 mb-2 px-4 py-2 bg-gray-500 text-white rounded-md"
                >
                  {folder}
                </Button>
              ))}
            </div>
          </div>
          <Tab.Group>
            <Tab.List className="flex-col border-transparent sm:flex-row bg-slate-200 dark:bg-darkmode-800">
              <Tab as="button" className={({ selected }) =>
                clsx(
                  "p-3 text-center text-sm font-medium w-full sm:w-auto",
                  selected ? "bg-white dark:bg-darkmode-600" : "hover:bg-slate-100 dark:hover:bg-darkmode-700"
                )
              }>
                {currentFolder || "Select a folder"}
              </Tab>
            </Tab.List>
            <Tab.Panels className="mt-5">
              <Tab.Panel>
                <div className="flex flex-col space-y-4">
                  <FormLabel htmlFor="pdf-upload" className="block text-sm font-medium text-gray-700">
                    Upload PDF Files
                  </FormLabel>
                  <FormInput
                    id="pdf-upload"
                    type="file"
                    multiple
                    onChange={onFileChange}
                    className="px-4 py-3 pr-10 !box"
                  />
                  <Button onClick={onUpload} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md">
                    Upload
                  </Button>
                  <div className="mt-5">
                    <h3 className="text-lg font-medium">Files in {currentFolder || "selected folder"}</h3>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.isArray(pdfs) && pdfs.map((file, index) => (
                        <div key={`${file.id}-${index}`} className="flex flex-col items-center p-4 bg-white dark:bg-darkmode-600 rounded-lg shadow">
                          <p className="text-sm font-medium">{file.name}</p>
                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="mt-2 text-blue-500">
                            View PDF
                          </a>
                        </div>
                      ))}

                    </div>
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
}

export default Main;
