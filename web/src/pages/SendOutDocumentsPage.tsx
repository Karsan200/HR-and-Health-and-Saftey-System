import {useCallback, useEffect, useRef, useState} from "react";
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    type SelectChangeEvent,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { useAuth } from "../AuthContext";
import {
    sendOutDocument,
    stripPdfExtension,
    type DocumentCategory,
} from "../logic/SendOutDocumentsService";
import { sendOutDocumentsStyles as styles, getDropZoneStyle } from "./SendOutDocumentsPage.styles";
import { SectionNavBar} from "../components/SectionNavbar";
import {type EmployeeListItemResponse, getEmployees} from "../logic/EmployeeOverviewService.ts";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type FormState = "idle" | "submitting" | "success" | "error";

export function SendOutDocumentsPage() {
    const { authenticationService } = useAuth();

    const [title, setTitle] = useState("");
    const [version, setVersion] = useState("");
    const [category, setCategory] = useState<DocumentCategory>("policy");
    const [sendTo, setSendTo] = useState("everyone");
    const [requireSignature, setRequireSignature] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [formState, setFormState] = useState<FormState>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [employees, setEmployees] = useState<EmployeeListItemResponse[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateAndSetFile = useCallback((candidate: File) => {
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
        setTitle((current) =>
            current.trim() ? current : stripPdfExtension(candidate.name)
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

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const handleCategoryChange = (e: SelectChangeEvent) => {
        const newCategory = e.target.value as DocumentCategory;

        setCategory(newCategory);

        if (newCategory === "handbook") {
            setSendTo("everyone");
            setSelectedEmployees([]);
        }
    };

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

        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setErrorMessage("Please enter a document title.");
            return;
        }

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
            setVersion("");
            setCategory("policy");
            setSendTo("everyone");
            setRequireSignature(true);
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
        <Box sx={styles.pageContainer}>

            {/* Tab navigation */}
            <SectionNavBar
                tabs={[
                    { label: "Upload and Send Documents", route: "/documents/send-out" },
                    { label: "Review Submissions", route: "/documents/review" },
                ]}
            />

            {/* Form card */}
            <Box sx={styles.formCard}>
                <Typography sx={styles.cardTitle}>
                    Upload New Documents
                </Typography>

                {/* Document Title */}
                <TextField
                    fullWidth
                    label="Document Title"
                    placeholder="e.g. Working Policy..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                />

                {/* Version */}
                <TextField
                    fullWidth
                    label="Version"
                    placeholder="e.g. 1.0"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    disabled={isSubmitting}
                />

                {/* Category */}
                <FormControl disabled={isSubmitting}>
                    <InputLabel>Category</InputLabel>
                    <Select
                        value={category}
                        label="Category"
                        onChange={handleCategoryChange}
                    >
                        <MenuItem value="policy">Policy</MenuItem>
                        <MenuItem value="sop">SOP</MenuItem>
                        <MenuItem value="handbook">Handbook</MenuItem>
                    </Select>
                </FormControl>

                {/* Send to */}
                <FormControl fullWidth disabled={isSubmitting || category === "handbook"}>
                    <InputLabel>Send to</InputLabel>
                    <Select
                        value={sendTo}
                        label="Send to"
                        onChange={(e) => setSendTo(e.target.value)}
                    >
                        <MenuItem value="everyone">Everyone</MenuItem>
                        <MenuItem value="specific">Specific Employees</MenuItem>
                    </Select>
                </FormControl>

                {sendTo === "specific" && (
                    <FormControl fullWidth>
                        <InputLabel>Select Employees</InputLabel>
                        <Select
                            multiple
                            value={selectedEmployees}
                            label="Select Employees"
                            renderValue={(selected) =>
                                employees
                                    .filter((e) => selected.includes(e.accountId))
                                    .map((e) => e.fullName)
                                    .join(", ")
                            }
                            onChange={(e) =>
                                setSelectedEmployees(e.target.value as number[])
                            }
                        >
                            {employees.map((employee) => (
                                <MenuItem key={employee.accountId} value={employee.accountId}>
                                    <Checkbox
                                        checked={selectedEmployees.includes(employee.accountId)}
                                    />
                                    {employee.fullName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                {/* Require signature */}
                <FormControlLabel
                    sx={styles.checkboxRow}
                    control={
                        <Checkbox
                            checked={requireSignature}
                            onChange={(e) => setRequireSignature(e.target.checked)}
                            disabled={isSubmitting}
                        />
                    }
                    label="Require Signature"
                />

                {/* Upload File section */}
                <Typography sx={styles.uploadSectionLabel}>
                    Upload File
                </Typography>

                {/* Drop zone */}
                <Box
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    style={getDropZoneStyle(isDragOver)}
                >
                    <UploadFileOutlinedIcon sx={styles.dropZoneIcon} />

                    {file ? (
                        <>
                            <Typography sx={styles.dropZoneFileName}>
                                {file.name}
                            </Typography>
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
                                PDF or docx, max {MAX_FILE_SIZE_MB}MB
                            </Typography>
                        </>
                    )}
                </Box>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    style={{ display: "none" }}
                    onChange={handleFileInputChange}
                />

                {fileError && (
                    <Typography sx={styles.errorText}>{fileError}</Typography>
                )}

                {errorMessage && (
                    <Typography sx={styles.errorText}>{errorMessage}</Typography>
                )}

                {formState === "success" && (
                    <Typography sx={styles.successText}>
                        Document uploaded and sent successfully.
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
                    {isSubmitting ? "Uploading..." : "Upload and Send Now"}
                </Button>
            </Box>
        </Box>
    );
}