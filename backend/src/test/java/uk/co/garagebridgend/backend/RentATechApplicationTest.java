package uk.co.garagebridgend.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(
        classes = RentATechApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@ActiveProfiles("test")
class RentATechApplicationTest {

    @Test
    void contextLoads() {
    }

    @Test
    void mainRuns() {
        RentATechApplication.main(new String[] {});
    }
}
