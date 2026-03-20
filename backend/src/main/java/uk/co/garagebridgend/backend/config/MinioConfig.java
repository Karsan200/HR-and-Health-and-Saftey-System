package uk.co.garagebridgend.backend.config;

import org.springframework.beans.factory.annotation.Value;
import io.minio.MinioClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for setting up the Minio client.
 */
@Configuration
public class MinioConfig {
    /** The URL of the Minio server. */
    @Value("${minio.url}")
    private String url;

    /** The access key for authenticating with the Minio server. */
    @Value("${minio.access.key}")
    private String accessKey;

    /** The secret key for authenticating with the Minio server. */
    @Value("${minio.access.secret}")
    private String secretKey;

    /** Creates and configures a MinioClient bean for interacting with the Minio server.
     * @return a configured MinioClient instance
     */
    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(url)
                .credentials(accessKey, secretKey)
                .build();
    }
}
