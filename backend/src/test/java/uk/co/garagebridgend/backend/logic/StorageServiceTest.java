package uk.co.garagebridgend.backend.logic;

import io.minio.GetObjectArgs;
import io.minio.GetObjectResponse;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class StorageServiceTest {

    private StorageService storageService;
    private MinioClient minioClient;

    @BeforeEach
    void setup() throws Exception {

        storageService = new StorageService();
        minioClient = mock(MinioClient.class);

        // Inject mocked MinioClient
        Field clientField = StorageService.class.getDeclaredField("minioClient");
        clientField.setAccessible(true);
        clientField.set(storageService, minioClient);

        // Inject bucket name
        Field bucketField = StorageService.class.getDeclaredField("bucketName");
        bucketField.setAccessible(true);
        bucketField.set(storageService, "test-bucket");
    }

    @Test
    void testGetObjectReturnsBase64EncodedContent() throws Exception {

        byte[] content = "hello minio".getBytes(StandardCharsets.UTF_8);

        GetObjectResponse mockResponse = mock(GetObjectResponse.class);
        when(mockResponse.readAllBytes()).thenReturn(content);
        when(minioClient.getObject(any(GetObjectArgs.class))).thenReturn(mockResponse);

        String result = storageService.getObject("file123");

        String expected = Base64.getEncoder().encodeToString(content);
        assertEquals(expected, result);
    }

    @Test
    void testGetObjectThrowsRuntimeException() throws Exception {

        when(minioClient.getObject(any(GetObjectArgs.class)))
                .thenThrow(new RuntimeException("MinIO error"));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> storageService.getObject("file123")
        );

        assertTrue(exception.getMessage().contains("Error retrieving object"));
    }

    @Test
    void testGetPresignedUrlSuccess() throws Exception {

        when(minioClient.getPresignedObjectUrl(any(GetPresignedObjectUrlArgs.class)))
                .thenReturn("http://test-url");

        String result = storageService.getPresignedUrl("file123");

        assertEquals("http://test-url", result);

        verify(minioClient).getPresignedObjectUrl(any(GetPresignedObjectUrlArgs.class));
    }

    @Test
    void testGetPresignedUrlThrowsRuntimeException() throws Exception {

        when(minioClient.getPresignedObjectUrl(any(GetPresignedObjectUrlArgs.class)))
                .thenThrow(new RuntimeException("MinIO error"));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> storageService.getPresignedUrl("file123")
        );

        assertTrue(exception.getMessage().contains("Error generating presigned URL"));
    }
}