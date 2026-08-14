import React, { useState, useEffect } from 'react';
import api from '../services/api';

const MyBooks = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        const response = await api.get('/borrower/my-books');
        setRecords(response.data);
      } catch (error) {
        console.error("Error fetching my books", error);
      }
    };
    fetchMyBooks();
  }, []);

  const isOverdue = (dueDate, returnDate) => {
    if (returnDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  return (
    <div>
      <h2>My Borrowed Books</h2>
      <table className="table table-bordered mt-4">
        <thead>
          <tr>
            <th>Book Name</th>
            <th>Category</th>
            <th>Borrow Date</th>
            <th>Due Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map(record => (
            <tr key={record.id}>
              <td>{record.book?.name}</td>
              <td>{record.book?.category}</td>
              <td>{record.borrowDate}</td>
              <td>{record.dueDate}</td>
              <td>
                {record.returnDate ? (
                  <span className="text-success">Returned on {record.returnDate}</span>
                ) : isOverdue(record.dueDate, record.returnDate) ? (
                  <span className="text-danger fw-bold">Not Returned (Overdue)</span>
                ) : (
                  <span className="text-warning">Borrowing</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyBooks;
