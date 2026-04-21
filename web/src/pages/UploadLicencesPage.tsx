import { useCallback, useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Checkbox,
    ListItemText,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { useAuth } from "../AuthContext";
import { sendOutDocumentsStyles as styles, getDropZoneStyle } from "./SendOutDocumentsPage.styles";
import { SectionNavBar } from "../components/SectionNavbar";
import { type EmployeeListItemResponse, getEmployees } from "../logic/EmployeeOverviewService";
import { uploadDrivingLicence } from "../logic/UploadLicencesService";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png"];

type FormState = "idle" | "submitting" | "success" | "error";

export function UploadLicencesPage() {
    const { authenticationService } = useAuth();

    const [title, setTitle] = useState("");
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">("");
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [formState, setFormState] = useState<FormState>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [employees, setEmployees] = useState<EmployeeListItemResponse[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateAndSetFile = useCallback((candidate: File) => {
        setFileError(null);
        const ext = candidate.name.toLowerCase();
        if (!ACCEPTED_EXTENSIONS.some((e) => ext.endsWith(e))) {
            setFileError("Only JPG or PNG files are accepted.");
            return;
        }
        if (candidate.size > MAX_FILE_SIZE_BYTES) {
            setFileError(`File must be under ${MAX_FILE_SIZE_MB} MB.`);
            return;
        }
        setFile(candidate);
        // Pre-fill title from filename, stripping extension
        setTitle((current) =>
            current.trim() ? current : candidate.name.replace(/\.[^.]+$/, "")
        );
    }, []);

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

    useEffect(() => {
        getEmployees(authenticationService, "")
            .then((res) => setEmployees(res ?? []))
            .catch(() => setEmployees([]));
    }, [authenticationService]);

    const handleSubmit = async () => {
        setErrorMessage(null);

        if (!file) {
            setErrorMessage("Please select a file to upload.");
            return;
        }
        if (!title.trim()) {
            setErrorMessage("Please enter a title.");
            return;
        }
        if (!selectedEmployeeId) {
            setErrorMessage("Please select an employee.");
            return;
        }

        setFormState("submitting");

        try {
            await uploadDrivingLicence(
                { title: title.trim(), employeeId: selectedEmployeeId, file },
                authenticationService
            );

            setFormState("success");
            setTitle("");
            setSelectedEmployeeId("");
            setFile(null);
        } catch (err) {
            setFormState("error");
            setErrorMessage(
                err instanceof Error ? err.message : "Something went wrong. Please try again."
            );
        }
    };

    const isSubmitting = formState === "submitting";

    return (
        <Box sx={styles.pageContainer}>
            <SectionNavBar
                tabs={[
                    { label: "Upload Licences", route: "/licences/upload" },
                    { label: "Review Licences", route: "/licences/review" },
                ]}
            />

            <Box sx={styles.formCard}>
                <Typography sx={styles.cardTitle}>Upload Driving Licence</Typography>

                {/* Employee selector */}
                <FormControl fullWidth disabled={isSubmitting}>
                    <InputLabel>Employee</InputLabel>
                    <Select
                        value={selectedEmployeeId}
                        label="Employee"
                        onChange={(e) => setSelectedEmployeeId(e.target.value as number)}
                    >
                        {employees.map((emp) => (
                            <MenuItem key={emp.accountId} value={emp.accountId}>
                                {emp.fullName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Title */}
                <TextField
                    fullWidth
                    label="Licence Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g. John Smith - Driving Licence"
                />

                {/* Drop zone */}
                <Typography sx={styles.uploadSectionLabel}>Upload Image</Typography>
                <Box
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onClick={() => fileInputRef.current?.click()}
                    style={getDropZoneStyle(isDragOver)}
                >
                    <UploadFileOutlinedIcon sx={styles.dropZoneIcon} />
                    {file ? (
                        <>
                            <Typography sx={styles.dropZoneFileName}>{file.name}</Typography>
                            <Typography sx={styles.dropZoneSubText}>
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Typography sx={styles.dropZoneText}>
                                Click to upload or drag and drop
                            </Typography>
                            <Typography sx={styles.dropZoneSubText}>
                                JPG or PNG, max {MAX_FILE_SIZE_MB}MB
                            </Typography>
                        </>
                    )}
                </Box>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    style={{ display: "none" }}
                    onChange={handleFileInputChange}
                />

                {fileError && <Typography sx={styles.errorText}>{fileError}</Typography>}
                {errorMessage && <Typography sx={styles.errorText}>{errorMessage}</Typography>}
                {formState === "success" && (
                    <Typography sx={styles.successText}>
                        Licence uploaded successfully.
                    </Typography>
                )}

                <Button
                    variant="contained"
                    sx={styles.submitButton}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    startIcon={<SendIcon />}
                    disableElevation
                >
                    {isSubmitting ? "Uploading..." : "Upload Licence"}
                </Button>
            </Box>
        </Box>
    );
}