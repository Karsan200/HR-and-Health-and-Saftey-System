package uk.co.garagebridgend.backend.logic;

import io.minio.*;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import io.minio.http.Method;
import java.util.concurrent.TimeUnit;

import java.io.InputStream;

/** Service class responsible for handling file storage operations using MinIO. */
@Service
public class StorageService {
    /** The name of the MinIO bucket to use for storing files, configured via application properties. */
    @Value("${minio.bucket.name}")
    private String bucketName;

    /** The maximum file size allowed for uploads, configured via application properties.*/
    @Getter
    @Value("${minio.file.maxsize}")
    private int maxFileSize;

    /** MinIO client for interacting with the MinIO storage service. */
    @Autowired
    private MinioClient minioClient;

    /** Uploads a file to the MinIO storage.
     * @param objectName the name of the object to be stored in MinIO
     * @param inputStream the InputStream of the file to be uploaded
     * @param extension the file extension to determine the content type
     * @throws RuntimeException if any error occurs during the upload process
     */
    public void uploadFile(final String objectName, final InputStream inputStream, final String extension)
            throws RuntimeException {
        // Determine the content type based on the file extension
        String contentType = switch (extension.toLowerCase()) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "pdf" -> "application/pdf";
            case "doc", "docx" -> "application/msword";
            default -> "application/octet-stream"; // Default binary type for unknown extensions
        };

        try {
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }
            minioClient.putObject(
                    PutObjectArgs.builder().bucket(bucketName).object(objectName).stream(
                                    inputStream, inputStream.available(), -1)
                            .contentType(contentType)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Error occurred: " + e.getMessage());
        }
    }

    /** Base64 decoding utility method.
     * @param base64Data the Base64-encoded string to decode
     * @return a byte array containing the decoded data
     */
    public byte[] decodeBase64(final String base64Data) {
        return java.util.Base64.getDecoder().decode(base64Data);
    }


    /** Base64 encoding utility method.
     * @param data the byte array to encode as a Base64 string
     * @return a Base64-encoded string representation of the input data
     */
    public String encodeBase64(final byte[] data) {
        return java.util.Base64.getEncoder().encodeToString(data);
    }

    /** Retrieves an object from MinIO storage and returns its content as a Base64-encoded string.
     * @param objectName the name of the object to retrieve from MinIO
     * @return a Base64-encoded string containing the object's data
     * @throws RuntimeException if any error occurs during retrieval or encoding
     */
    public String getObject(final String objectName) throws RuntimeException {
        try (InputStream stream = minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectName)
                        .build())) {
            return encodeBase64(stream.readAllBytes());
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving object: " + e.getMessage(), e);
        }
    }

    /**
     * Generates a pre-signed URL for accessing a file in MinIO storage.
     * @param objectName the name of the object in MinIO storage
     * @return a pre-signed URL string valid for 1 hour
     * @throws RuntimeException if any error occurs during URL generation
     */
    public String getPresignedUrl(final String objectName) throws RuntimeException {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucketName)
                            .object(objectName)
                            .expiry(1, TimeUnit.HOURS)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Error generating presigned URL: " + e.getMessage());
        }
    }
}
