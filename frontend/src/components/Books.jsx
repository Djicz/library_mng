import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  FileCode2, 
  Search, 
  Edit3, 
  Trash2, 
  Send, 
  Tag, 
  Package, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [bulkBooksJson, setBulkBooksJson] = useState('[\n  {\n    "name": "Lập trình React Hiện Đại",\n    "category": { "id": "category-id" },\n    "quantity": 5\n  }\n]');
  const [bulkError, setBulkError] = useState('');
  const [newBook, setNewBook] = useState({ name: '', category: '', quantity: 1 });
  const [editBookId, setEditBookId] = useState(null);
  const [editBookData, setEditBookData] = useState({ name: '', category: '', quantity: 1 });
  const [actionSuccess, setActionSuccess] = useState('');

  const navigate = useNavigate();

  const fetchBooks = async (searchTerm = '') => {
    try {
      const response = await api.get(`/books${searchTerm ? '?search=' + encodeURIComponent(searchTerm) : ''}`);
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/manager/category');
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const triggerSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks(search);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đầu sách "${name}"?`)) {
      try {
        await api.delete(`/books/${id}`);
        triggerSuccess(`Đã xóa sách "${name}" thành công.`);
        fetchBooks(search);
      } catch (error) {
        console.error("Error deleting book", error);
        alert(error.response?.data?.message || "Lỗi khi xóa sách.");
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookData = { ...newBook, category: { id: newBook.category } };
      await api.post('/books', bookData);
      setNewBook({ name: '', category: '', quantity: 1 });
      setShowAddModal(false);
      triggerSuccess('Thêm đầu sách mới thành công!');
      fetchBooks(search);
    } catch (error) {
      console.error("Error adding book", error);
      alert(error.response?.data?.message || 'Lỗi khi thêm sách.');
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setBulkError('');
    try {
      const parsedData = JSON.parse(bulkBooksJson);
      if (!Array.isArray(parsedData)) {
        setBulkError('Dữ liệu JSON phải là một Mảng (Array)');
        return;
      }
      await api.post('/books/in-books', parsedData);
      setShowBulkModal(false);
      triggerSuccess(`Import thành công ${parsedData.length} đầu sách!`);
      fetchBooks(search);
    } catch (error) {
      console.error("Error adding bulk books", error);
      setBulkError(error.message || 'Dữ liệu JSON không hợp lệ hoặc lỗi máy chủ.');
    }
  };

  const startEdit = (book) => {
    setEditBookId(book.id);
    setEditBookData({
      name: book.name,
      category: book.category?.id || '',
      quantity: book.quantity
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookData = { ...editBookData, category: { id: editBookData.category } };
      await api.put(`/books/update/${editBookId}`, bookData);
      setShowEditModal(false);
      setEditBookId(null);
      triggerSuccess('Cập nhật thông tin sách thành công!');
      fetchBooks(search);
    } catch (error) {
      console.error("Error updating book", error);
      alert(error.response?.data?.message || "Lỗi khi cập nhật sách.");
    }
  };

  const filteredBooks = useMemo(() => {
    return selectedCategory 
      ? books.filter(b => b.category?.id === selectedCategory) 
      : books;
  }, [books, selectedCategory]);

  const totalPages = Math.ceil(filteredBooks.length / pageSize) || 1;

  // Sliced books for instant rendering
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBooks.slice(start, start + pageSize);
  }, [filteredBooks, currentPage, pageSize]);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, search]);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const delta = 1;
    const range = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    if (currentPage - delta > 2) {
      range.unshift('...');
    }
    if (currentPage + delta < totalPages - 1) {
      range.push('...');
    }
    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }
    return range;
  };

  return (
    <div className="animate-fade-in">
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Quản Lý Đầu Sách
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
            Tra cứu, thêm mới, sửa đổi và gán mượn sách cho độc giả
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            className="btn-primary-gradient" 
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={18} />
            <span>Thêm Sách Mới</span>
          </button>
          <button 
            className="btn-secondary-modern" 
            onClick={() => setShowBulkModal(true)}
          >
            <FileCode2 size={18} style={{ color: 'var(--primary-light)' }} />
            <span>Import JSON</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="badge-status badge-status-success w-100 mb-3" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="card-glass mb-4" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <form onSubmit={handleSearch} className="search-input-group">
            <Search size={18} className="search-icon-inside" />
            <input 
              type="text" 
              className="search-input-field" 
              placeholder="Tìm kiếm sách theo tên..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Thể loại:</span>
            <select 
              className="form-select-custom" 
              style={{ width: 'auto', minWidth: '180px', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="">Tất cả thể loại ({categories.length})</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Books Table */}
      <div className="table-modern-wrapper">
        <table className="table-modern">
          <thead>
            <tr>
              <th style={{ width: '35%' }}>Tên Sách</th>
              <th style={{ width: '25%' }}>Thể Loại</th>
              <th style={{ width: '20%' }}>Số Lượng / Tồn Kho</th>
              <th style={{ width: '20%', textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBooks.map(book => (
              <tr key={book.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{book.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mã: #{book.id ? book.id.substring(0, 8) : 'N/A'}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge-status badge-status-info">
                    <Tag size={12} />
                    {book.category?.name || 'Chưa phân loại'}
                  </span>
                </td>
                <td>
                  {book.quantity > 0 ? (
                    <span className="badge-status badge-status-success">
                      <span className="badge-dot"></span>
                      Còn {book.quantity} cuốn
                    </span>
                  ) : (
                    <span className="badge-status badge-status-danger">
                      <span className="badge-dot"></span>
                      Hết sách (0)
                    </span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    {book.quantity > 0 && (
                      <button 
                        className="btn-action-icon btn-action-assign" 
                        title="Tạo phiếu mượn cho sách này"
                        onClick={() => navigate('/manager/borrows?assignBookId=' + book.id)}
                      >
                        <Send size={15} />
                      </button>
                    )}
                    <button 
                      className="btn-action-icon btn-action-edit" 
                      title="Chỉnh sửa thông tin"
                      onClick={() => startEdit(book)}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button 
                      className="btn-action-icon btn-action-delete" 
                      title="Xóa đầu sách"
                      onClick={() => handleDelete(book.id, book.name)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredBooks.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <BookOpen size={42} style={{ opacity: 0.3 }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>Không tìm thấy đầu sách nào phù hợp.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        {filteredBooks.length > 0 && (
          <div className="pagination-wrapper">
            <div className="pagination-info">
              <span>
                Hiển thị <span className="highlight">{Math.min((currentPage - 1) * pageSize + 1, filteredBooks.length)}</span> - <span className="highlight">{Math.min(currentPage * pageSize, filteredBooks.length)}</span> trên <span className="highlight">{filteredBooks.length}</span> đầu sách
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ trang:</span>
                <select
                  className="form-select-custom"
                  style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.8rem', height: '32px' }}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="pagination-controls">
              <button
                className="pagination-btn"
                title="Trang đầu tiên"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                className="pagination-btn"
                title="Trang trước"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                <ChevronLeft size={16} />
              </button>

              {getPageNumbers().map((pageNum, idx) => (
                pageNum === '...' ? (
                  <span key={`ellipsis-${idx}`} className="pagination-ellipsis">...</span>
                ) : (
                  <button
                    key={`page-${pageNum}`}
                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                )
              ))}

              <button
                className="pagination-btn"
                title="Trang tiếp"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                <ChevronRight size={16} />
              </button>
              <button
                className="pagination-btn"
                title="Trang cuối cùng"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Add Book */}
      {showAddModal && (
        <div className="modal-backdrop-custom" onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog-custom" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div className="modal-title-custom">
                <Plus size={20} style={{ color: 'var(--primary-light)' }} />
                <span>Thêm Đầu Sách Mới</span>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-body-custom">
                <div className="form-group-custom">
                  <label className="form-label-custom">Tên Sách <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input 
                    type="text" 
                    className="form-control-custom" 
                    placeholder="Ví dụ: Đắc Nhân Tâm"
                    value={newBook.name} 
                    onChange={e => setNewBook({...newBook, name: e.target.value})} 
                    required 
                  />
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">Thể Loại <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select 
                    className="form-select-custom" 
                    value={newBook.category} 
                    onChange={e => setNewBook({...newBook, category: e.target.value})} 
                    required
                  >
                    <option value="">-- Chọn thể loại sách --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">Số Lượng Nhập <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input 
                    type="number" 
                    className="form-control-custom" 
                    value={newBook.quantity} 
                    onChange={e => setNewBook({...newBook, quantity: Math.max(1, parseInt(e.target.value) || 0)})} 
                    min="1" 
                    required 
                  />
                </div>
              </div>

              <div className="modal-footer-custom">
                <button 
                  type="button" 
                  className="btn-secondary-modern" 
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-primary-gradient">
                  <span>Lưu Đầu Sách</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Book */}
      {showEditModal && (
        <div className="modal-backdrop-custom" onClick={() => setShowEditModal(false)}>
          <div className="modal-dialog-custom" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div className="modal-title-custom">
                <Edit3 size={20} style={{ color: 'var(--warning)' }} />
                <span>Chỉnh Sửa Đầu Sách</span>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body-custom">
                <div className="form-group-custom">
                  <label className="form-label-custom">Tên Sách</label>
                  <input 
                    type="text" 
                    className="form-control-custom" 
                    value={editBookData.name} 
                    onChange={e => setEditBookData({...editBookData, name: e.target.value})} 
                    required 
                  />
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">Thể Loại</label>
                  <select 
                    className="form-select-custom" 
                    value={editBookData.category} 
                    onChange={e => setEditBookData({...editBookData, category: e.target.value})} 
                    required
                  >
                    <option value="">-- Chọn thể loại --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">Số Lượng Tồn</label>
                  <input 
                    type="number" 
                    className="form-control-custom" 
                    value={editBookData.quantity} 
                    onChange={e => setEditBookData({...editBookData, quantity: Math.max(0, parseInt(e.target.value) || 0)})} 
                    min="0" 
                    required 
                  />
                </div>
              </div>

              <div className="modal-footer-custom">
                <button 
                  type="button" 
                  className="btn-secondary-modern" 
                  onClick={() => setShowEditModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary-gradient">
                  <span>Cập Nhật Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Bulk Import */}
      {showBulkModal && (
        <div className="modal-backdrop-custom" onClick={() => setShowBulkModal(false)}>
          <div className="modal-dialog-custom" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div className="modal-title-custom">
                <FileCode2 size={20} style={{ color: 'var(--primary-light)' }} />
                <span>Import Sách Hàng Loạt (JSON Array)</span>
              </div>
              <button 
                onClick={() => setShowBulkModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit}>
              <div className="modal-body-custom">
                {bulkError && (
                  <div className="badge-status badge-status-danger w-100 mb-3" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    <AlertCircle size={16} />
                    <span>{bulkError}</span>
                  </div>
                )}

                <div className="form-group-custom">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label-custom" style={{ margin: 0 }}>Dữ liệu JSON Array</label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mẫu định dạng chuẩn</span>
                  </div>
                  <textarea 
                    className="form-control-custom" 
                    rows="9" 
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem', background: '#0f172a', color: '#38bdf8', borderColor: '#334155' }}
                    value={bulkBooksJson} 
                    onChange={e => setBulkBooksJson(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="modal-footer-custom">
                <button 
                  type="button" 
                  className="btn-secondary-modern" 
                  onClick={() => setShowBulkModal(false)}
                >
                  Đóng
                </button>
                <button type="submit" className="btn-primary-gradient">
                  <span>Tiến Hành Import</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
