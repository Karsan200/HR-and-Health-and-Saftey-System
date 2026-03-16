package uk.co.garagebridgend.backend.logic;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Service
public class StorageService {
    @Value("${minio.bucket.name}")
    private String bucketName;

    @Getter
    @Value("${minio.file.maxsize}")
    private int maxFileSize;

    @Autowired
    private MinioClient minioClient;

    /** Uploads a file to the MinIO storage.
     * @param objectName the name of the object to be stored in MinIO
     * @param inputStream the InputStream of the file to be uploaded
     * @param contentType the MIME type of the file being uploaded
     * @throws RuntimeException if any error occurs during the upload process
     */
    public void uploadFile(String objectName, InputStream inputStream, String contentType) {
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
    public byte[] decodeBase64(String base64Data) {
        return java.util.Base64.getDecoder().decode(base64Data);
    }
}
