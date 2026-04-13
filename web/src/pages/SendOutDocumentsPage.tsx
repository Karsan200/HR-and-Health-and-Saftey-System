import { useCallback, useRef, useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    type SelectChangeEvent,
} from "@mui/material";
import { useAuth } from "../AuthContext";
import {
    sendOutDocument,
    stripPdfExtension,
    type DocumentCategory,
} from "../logic/SendOutDocumentsService";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type FormState = "idle" | "submitting" | "success" | "error";

export function SendOutDocumentsPage() {
    const { authenticationService } = useAuth();

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<DocumentCategory>("policy");
    const [requireSignature, setRequireSignature] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [formState, setFormState] = useState<FormState>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateAndSetFile = useCallback(
        (candidate: File) => {
            setFileError(null);

            if (!candidate.name.toLowerCase().endsWith(".pdf")) {
                setFileError("Only PDF files are accepted.");
                return;
            }

            if (candidate.size > MAX_FILE_SIZE_BYTES) {
                setFileError(`File must be under ${MAX_FILE_SIZE_MB} MB.`);
                return;
            }

            setFile(candidate);

            // Pre-fill the title from the filename if the user hasn't typed one yet
            setTitle((current) =>
                current.trim() ? current : stripPdfExtension(candidate.name)
            );
        },
        []
    );

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0];
        if (picked) validateAndSetFile(picked);
        e.target.value = "";
    };

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragOver(false);
            const dropped = e.dataTransfer.files[0];
            if (dropped) validateAndSetFile(dropped);
        },
        [validateAndSetFile]
    );

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const handleCategoryChange = (e: SelectChangeEvent) => {
        setCategory(e.target.value as DocumentCategory);
    };

    const handleSubmit = async () => {
        setErrorMessage(null);

        if (!file) {
            setErrorMessage("Please select a file to upload.");
            return;
        }

        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setErrorMessage("Please enter a document title.");
            return;
        }

        // Mirror the handbook validation so the user gets feedback before the network call
        if (
            category === "handbook" &&
            !trimmedTitle.toLowerCase().includes("handbook")
        ) {
            setErrorMessage(
                "Handbook documents must include the word 'handbook' in the title."
            );
            return;
        }

        setFormState("submitting");

        try {
            await sendOutDocument(
                { title: trimmedTitle, category, requireSignature, file },
                authenticationService
            );

            setFormState("success");
            setTitle("");
            setCategory("policy");
            setRequireSignature(false);
            setFile(null);
        } catch (err) {
            setFormState("error");
            setErrorMessage(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please try again."
            );
        }
    };

    const isSubmitting = formState === "submitting";

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, px: 2 }}>
            <Typography variant="h5" gutterBottom>
                Upload New Document
            </Typography>

            {/* File drop zone */}
            <Box
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                    border: "2px dashed",
                    borderColor: isDragOver ? "primary.main" : "grey.400",
                    borderRadius: 1,
                    p: 4,
                    mb: 2,
                    textAlign: "center",
                    cursor: "pointer",
                    bgcolor: isDragOver ? "action.hover" : "transparent",
                    transition: "border-color 0.15s, background-color 0.15s",
                }}
            >
                <Typography variant="body1">
                    {file ? file.name : "Click to upload or drag and drop"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    PDF only · max {MAX_FILE_SIZE_MB} MB
                </Typography>
                {file && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </Typography>
                )}
            </Box>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={handleFileInputChange}
            />

            {fileError && (
                <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                    {fileError}
                </Typography>
            )}

            {/* Document title */}
            <TextField
                fullWidth
                label="Document Title"
                placeholder="e.g. Working Policy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ mb: 2 }}
                disabled={isSubmitting}
            />

            {/* Category */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Category
            </Typography>
            <Select
                fullWidth
                value={category}
                onChange={handleCategoryChange}
                sx={{ mb: 2 }}
                disabled={isSubmitting}
            >
                <MenuItem value="policy">Policy</MenuItem>
                <MenuItem value="sop">SOP</MenuItem>
                <MenuItem value="handbook">Handbook</MenuItem>
            </Select>

            {/* Require signature */}
            <FormControlLabel
                control={
                    <Checkbox
                        checked={requireSignature}
                        onChange={(e) => setRequireSignature(e.target.checked)}
                        disabled={isSubmitting}
                    />
                }
                label="Require Signature"
                sx={{ mb: 2, display: "block" }}
            />

            {errorMessage && (
                <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                    {errorMessage}
                </Typography>
            )}

            {formState === "success" && (
                <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                    Document uploaded and sent successfully.
                </Typography>
            )}

            <Button
                fullWidth
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting}
            >
                {isSubmitting ? "Uploading..." : "Upload and Send Now"}
            </Button>
        </Box>
    );
}