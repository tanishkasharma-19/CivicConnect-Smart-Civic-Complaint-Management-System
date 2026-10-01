package com.nagarvaani;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NagarvaaniApplication {

	public static void main(String[] args) {
		SpringApplication.run(NagarvaaniApplication.class, args);
	}

}
