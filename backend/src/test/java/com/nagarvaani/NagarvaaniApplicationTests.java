package com.nagarvaani;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// Needs a real database (DB_URL etc.), so it is skipped in normal test runs.
@Disabled("Needs a live database and environment variables")
@SpringBootTest
class NagarvaaniApplicationTests {


	@Test
	void contextLoads() {
	}

}