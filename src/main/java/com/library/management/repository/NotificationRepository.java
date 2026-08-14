package com.library.management.repository;

import com.library.management.entity.Notification;
import com.library.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
}
