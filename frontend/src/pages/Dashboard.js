import React, { useEffect, useState, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('tasks');

  return (
    <div style={styles.container}>
      <header style={styles.header}>
          <div style={styles.headerWelcome}>
            Welcome, {user?.name}
          </div>
        <button onClick={logout} style={styles.logoutButton}>Logout</button>
      </header>

      {isAdmin && (
        <div style={styles.tabsContainer}>
          <div style={styles.tabs}>
            <button onClick={() => setActiveTab('tasks')} style={activeTab === 'tasks' ? styles.activeTab : styles.tab}>Tasks</button>
            <button onClick={() => setActiveTab('users')} style={activeTab === 'users' ? styles.activeTab : styles.tab}>User Management</button>
          </div>
        </div>
      )}

      <main>
        {activeTab === 'tasks' && <TasksView isAdmin={isAdmin} />}
        {isAdmin && activeTab === 'users' && <UserManagementView />}
      </main>
    </div>
  );
}

const TasksView = ({ isAdmin }) => {
    const { user } = useContext(AuthContext);
    const currentUserId = user?._id || user?.id || user?.userId || user?.uid;
  const [tasks, setTasks] = useState([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isPermissionModalOpen, setPermissionModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'In Progress', priority: 'Medium' });
  const [msg, setMsg] = useState('');
  
  const fetchTasks = async () => {
    try {
      const res = await API.get('/tasks');
      setTasks(res.data);
    } catch (err) { console.log('Could not fetch tasks.'); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const createTask = async (e) => {
    e.preventDefault();
    if (!form.title) { setMsg('Title is required'); return; }
    try {
      await API.post('/tasks', form);
      setForm({ title: '', description: '', status: 'In Progress', priority: 'Medium' });
      setMsg('');
      fetchTasks();
      setCreateModalOpen(false);
    } catch (err) {
        setMsg(err.response?.data?.errors ? err.response.data.errors.map(e => e.msg).join(', ') : err.response?.data?.error || 'Error creating task');
    }
  };

  const updateTask = async (e) => {
    e.preventDefault();
    if (!form.title) { setMsg('Title is required'); return; }
    try {
      await API.put(`/tasks/${selectedTask._id}`, form);
      setMsg('');
      fetchTasks();
      setEditModalOpen(false);
    } catch (err) {
        setMsg(err.response?.data?.errors ? err.response.data.errors.map(e => e.msg).join(', ') : err.response?.data?.error || 'Error updating task');
    }
  };

  const deleteTask = async (taskId) => {
        const task = tasks.find(t => t._id === taskId);

        if (!task) {
            setMsg('Task not found');
            return;
        }

        const ownerId = typeof task.owner === 'string' ? task.owner : (task.owner?._id || task.owner?.id);
        const isOwner = currentUserId === ownerId;

        if (!isOwner) {
            setPermissionModalOpen(true);
            return;
        }

        setTaskToDelete(taskId);
        setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
        await API.delete(`/tasks/${taskToDelete}`);
        fetchTasks();
        setDeleteConfirmOpen(false);
        setTaskToDelete(null);
    } catch (err) {
        setMsg('Failed to delete task');
        setDeleteConfirmOpen(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await API.put(`/tasks/${taskId}`, { status });
      fetchTasks();
    } catch (err) {
      console.log('Error updating status');
    }
  };

  const openViewModal = (task) => {
    setSelectedTask(task);
    setViewModalOpen(true);
  }

  const openEditModal = (task) => {
    setSelectedTask(task);
    setForm(task);
    setEditModalOpen(true);
  }



  return (
      <div>
        <div style={{...styles.subHeader, justifyContent: 'space-between'}}>
            <div>
                <h1 style={styles.headerTitle}>My Tasks</h1>
                <p style={styles.headerSubtitle}>{isAdmin ? 'Viewing all tasks from all users (Admin Access)' : 'Manage your personal tasks'}</p>
            </div>
            <button onClick={() => setCreateModalOpen(true)} style={styles.createTaskButton}>+ Create Task</button>
        </div>
        <div style={styles.contentBox}>
            {tasks.length === 0 ? (
                <p>No tasks yet. Create your first task to get started!</p>
            ) : (
                <>
                    {isAdmin ? (
                        <>
                            <section style={styles.sectionCard}>
                                <p style={{fontSize: '1.2rem', fontWeight: 'bold', margin: 0}}>My Tasks</p>
                                <p style={{color: '#6c757d', marginTop: '0.25rem'}}>Tasks you created</p>
                                {(() => {
                                    const myTasks = tasks.filter(task => {
                                        const ownerId = typeof task.owner === 'string' ? task.owner : (task.owner?._id || task.owner?.id);
                                        return ownerId === currentUserId;
                                    });
                                    if (myTasks.length === 0) return <p style={{marginTop: '0.75rem'}}>You haven't created any tasks yet.</p>;
                                    return (
                                        <table style={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th style={styles.th}>Title</th>
                                                    <th style={styles.th}>Priority</th>
                                                    <th style={styles.th}>Status</th>
                                                    <th style={styles.th}>View</th>
                                                    <th style={styles.th}>Edit</th>
                                                    <th style={styles.th}>Delete</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {myTasks.map(task => {
                                                    const ownerId = typeof task.owner === 'string' ? task.owner : (task.owner?._id || task.owner?.id);
                                                    const isOwner = currentUserId === ownerId;
                                                    return (
                                                        <tr key={task._id}>
                                                            <td style={styles.td}>{task.title}</td>
                                                            <td style={styles.td}>{task.priority}</td>
                                                            <td style={styles.td}>
                                                                {isOwner ? (
                                                                    <select
                                                                        value={task.status}
                                                                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                                                        style={{
                                                                            ...styles.statusSelect,
                                                                            ...styles.statusColors[task.status],
                                                                        }} >
                                                                        <option value="To Do">To Do</option>
                                                                        <option value="In Progress">In Progress</option>
                                                                        <option value="Done">Done</option>
                                                                    </select>
                                                                ) : (
                                                                    <span style={{...styles.statusBadge, ...styles.statusColors[task.status]}}>{task.status}</span>
                                                                )}
                                                            </td>
                                                            <td style={styles.td}><button onClick={() => openViewModal(task)} style={{...styles.iconButton, ...styles.viewAction}} title="View"><i className="fas fa-eye"></i></button></td>
                                                            <td style={styles.td}><button onClick={() => openEditModal(task)} style={{...styles.iconButton, ...styles.editAction}} title="Edit"><i className="fas fa-edit"></i></button></td>
                                                            <td style={styles.td}><button onClick={() => deleteTask(task._id)} style={{...styles.iconButton, ...styles.deleteAction}} title="Delete"><i className="fas fa-trash"></i></button></td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    );
                                })()}
                            </section>

                            <div style={styles.sectionBreak} aria-hidden="true">
                                <div style={styles.centerLine} />
                            </div>

                            <section style={styles.sectionCard}>
                                <p style={{fontSize: '1.2rem', fontWeight: 'bold', margin: 0}}>Users' Tasks</p>
                                <p style={{color: '#6c757d', marginTop: '0.25rem'}}>Tasks created by other users</p>
                                {(() => {
                                    const otherTasks = tasks.filter(task => {
                                        const ownerId = typeof task.owner === 'string' ? task.owner : (task.owner?._id || task.owner?.id);
                                        return ownerId !== currentUserId;
                                    });
                                    if (otherTasks.length === 0) return <p style={{marginTop: '0.75rem'}}>No tasks from other users.</p>;
                                    return (
                                        <table style={styles.table}>
                                            <thead>
                                                        <tr>
                                                            <th style={styles.th}>Title</th>
                                                            <th style={styles.th}>Priority</th>
                                                            <th style={styles.th}>Created By</th>
                                                            <th style={styles.th}>Status</th>
                                                            <th style={styles.th}>View</th>
                                                        </tr>
                                            </thead>
                                            <tbody>
                                                {otherTasks.map(task => (
                                                        <tr key={task._id}>
                                                            <td style={styles.td}>{task.title}</td>
                                                            <td style={styles.td}>{task.priority}</td>
                                                            <td style={styles.td}>{task.owner?.name || 'N/A'}</td>
                                                            <td style={styles.td}>
                                                                <span title="Only the task creator can change status" style={{...styles.statusBadge, ...styles.statusColors[task.status]}}>{task.status}</span>
                                                            </td>
                                                            <td style={styles.td}><button onClick={() => openViewModal(task)} style={{...styles.iconButton, ...styles.viewAction}} title="View"><i className="fas fa-eye"></i></button></td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    );
                                })()}
                            </section>
                        </>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Title</th>
                                    <th style={styles.th}>Priority</th>
                                    {isAdmin && <th style={styles.th}>Created By</th>}
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>View</th>
                                    <th style={styles.th}>Edit</th>
                                    <th style={styles.th}>Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => {
                                    const ownerId = typeof task.owner === 'string' ? task.owner : (task.owner?._id || task.owner?.id);
                                    const isOwner = currentUserId === ownerId;
                                    return (
                                        <tr key={task._id}>
                                            <td style={styles.td}>{task.title}</td>
                                            <td style={styles.td}>{task.priority}</td>
                                            {isAdmin && <td style={styles.td}>{task.owner?.name || 'N/A'}</td>}
                                            <td style={styles.td}>
                                                {isOwner ? (
                                                    <select
                                                        value={task.status}
                                                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                                        style={{
                                                            ...styles.statusSelect,
                                                            ...styles.statusColors[task.status],
                                                        }} >
                                                        <option value="To Do">To Do</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Done">Done</option>
                                                    </select>
                                                ) : (
                                                    <span title="Only the task creator can change status" style={{...styles.statusBadge, ...styles.statusColors[task.status]}}>{task.status}</span>
                                                )}
                                            </td>
                                            <td style={styles.td}><button onClick={() => openViewModal(task)} style={{...styles.iconButton, ...styles.viewAction}} title="View"><i className="fas fa-eye"></i></button></td>
                                            <td style={styles.td}><button onClick={() => openEditModal(task)} style={{...styles.iconButton, ...styles.editAction}} title="Edit"><i className="fas fa-edit"></i></button></td>
                                            <td style={styles.td}><button onClick={() => deleteTask(task._id)} style={{...styles.iconButton, ...styles.deleteAction}} title="Delete"><i className="fas fa-trash"></i></button></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </>
            )}
        </div>
        {isCreateModalOpen && <CreateTaskModal form={form} msg={msg} handleFormChange={handleFormChange} createTask={createTask} setModalOpen={setCreateModalOpen} />}
        {isViewModalOpen && <ViewTaskModal task={selectedTask} setModalOpen={setViewModalOpen} />}
        {isEditModalOpen && <EditTaskModal form={form} msg={msg} handleFormChange={handleFormChange} updateTask={updateTask} setModalOpen={setEditModalOpen} />}
        {isPermissionModalOpen && <PermissionModal setModalOpen={setPermissionModalOpen} />}
        {isDeleteConfirmOpen && <DeleteConfirmModal onConfirm={confirmDelete} onCancel={() => { setDeleteConfirmOpen(false); setTaskToDelete(null); }} />}
      </div>
  );
};

const UserManagementView = () => {
    const { user: currentUser } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await API.get('/admin/users');
            setUsers(res.data.filter(user => user.role !== 'admin'));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch users');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const deleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await API.delete(`/admin/users/${userId}`);
                fetchUsers();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    return (
        <div>
            <div style={styles.subHeader}>
                <h1 style={styles.headerTitle}>User Management</h1>
            </div>
            {error && <div style={{...styles.contentBox, color: 'red', border: '1px solid red', backgroundColor: '#f8d7da'}}>{error}</div>}
            <div style={{...styles.contentBox, marginTop: '1rem'}}>
                <p style={{fontSize: '1.2rem', fontWeight: 'bold'}}>All Users</p>
                <p style={{color: '#6c757d'}}>Manage user accounts and permissions</p>
                {users.length === 0 ? (
                    <p>No users found</p>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Name</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>Role</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td style={styles.td}>{user.name}</td>
                                    <td style={styles.td}>{user.email}</td>
                                    <td style={styles.td}>{user.role}</td>
                                    <td style={styles.td}>
                                        {user._id !== currentUser._id && (
                                            <button onClick={() => deleteUser(user._id)} style={styles.deleteUserButton}>Delete</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const CreateTaskModal = ({ form, msg, handleFormChange, createTask, setModalOpen }) => (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Create New Task</h2>
          <button onClick={() => setModalOpen(false)} style={styles.closeButton}>&times;</button>
        </div>
        {msg && <p style={styles.errorMsg}>{msg}</p>}
        <form onSubmit={createTask}>
            <label style={styles.formLabel} htmlFor="title">Title *</label>
            <input id="title" name="title" style={styles.input} value={form.title} onChange={handleFormChange} placeholder="Enter task title" />
            <label style={styles.formLabel} htmlFor="description">Description</label>
            <input id="description" name="description" style={styles.input} value={form.description} onChange={handleFormChange} placeholder="Enter task description (optional)" />
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{width: '50%'}}><label style={styles.formLabel} htmlFor="status">Status</label><select id="status" name="status" style={styles.select} value={form.status} onChange={handleFormChange}><option>In Progress</option><option>To Do</option><option>Done</option></select></div>
                <div style={{width: '50%'}}><label style={styles.formLabel} htmlFor="priority">Priority</label><select id="priority" name="priority" style={styles.select} value={form.priority} onChange={handleFormChange}><option>Medium</option><option>Low</option><option>High</option></select></div>
            </div>
            <div style={styles.formActions}><button type="button" onClick={() => setModalOpen(false)} style={styles.cancelButton}>Cancel</button><button type="submit" style={styles.createButton}>Create Task</button></div>
        </form>
      </div>
    </div>
);

const ViewTaskModal = ({ task, setModalOpen }) => (
    <div style={styles.modalOverlay}>
        <div style={{...styles.modal, width: '500px'}}>
            <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}><i className="fas fa-tasks" style={{marginRight: '1rem'}}></i>{task.title}</h2>
                <button onClick={() => setModalOpen(false)} style={styles.closeButton}>&times;</button>
            </div>
            <div style={styles.viewTaskBody}>
                <p><strong>Description:</strong> {task.description || 'N/A'}</p>
                <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '2rem'}}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <strong style={{marginRight: '0.5rem'}}>Status:</strong>
                        <span style={{...styles.statusSelect, ...styles.statusColors[task.status]}}>{task.status}</span>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <strong style={{marginRight: '0.5rem'}}>Priority:</strong>
                        <span>{task.priority}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const EditTaskModal = ({ form, msg, handleFormChange, updateTask, setModalOpen }) => (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Edit Task</h2>
          <button onClick={() => setModalOpen(false)} style={styles.closeButton}>&times;</button>
        </div>
        {msg && <p style={styles.errorMsg}>{msg}</p>}
        <form onSubmit={updateTask}>
            <label style={styles.formLabel} htmlFor="title">Title *</label>
            <input id="title" name="title" style={styles.input} value={form.title} onChange={handleFormChange} placeholder="Enter task title" />
            <label style={styles.formLabel} htmlFor="description">Description</label>
            <input id="description" name="description" style={styles.input} value={form.description} onChange={handleFormChange} placeholder="Enter task description (optional)" />
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{width: '50%'}}><label style={styles.formLabel} htmlFor="status">Status</label><select id="status" name="status" style={styles.select} value={form.status} onChange={handleFormChange}><option>In Progress</option><option>To Do</option><option>Done</option></select></div>
                <div style={{width: '50%'}}><label style={styles.formLabel} htmlFor="priority">Priority</label><select id="priority" name="priority" style={styles.select} value={form.priority} onChange={handleFormChange}><option>Medium</option><option>Low</option><option>High</option></select></div>
            </div>
            <div style={styles.formActions}><button type="button" onClick={() => setModalOpen(false)} style={styles.cancelButton}>Cancel</button><button type="submit" style={styles.createButton}>Update Task</button></div>
        </form>
      </div>
    </div>
);

const PermissionModal = ({ setModalOpen }) => (
    <div style={styles.modalOverlay}>
        <div style={styles.modal}>
            <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Permission Denied</h2>
                <button onClick={() => setModalOpen(false)} style={styles.closeButton}>&times;</button>
            </div>
            <p>You are not authorized to perform this action.</p>
            <div style={styles.formActions}>
                <button onClick={() => setModalOpen(false)} style={styles.cancelButton}>Close</button>
            </div>
        </div>
    </div>
);

const DeleteConfirmModal = ({ onConfirm, onCancel }) => (
    <div style={styles.modalOverlay}>
        <div style={{...styles.modal, width: '400px'}}>
            <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Delete?</h2>
                <button onClick={onCancel} style={styles.closeButton}>&times;</button>
            </div>
            <p style={{fontSize: '1rem', color: '#495057', marginBottom: '2rem'}}>Are you sure? You won't be able to undo this action!</p>
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '0.5rem'}}>
                <button onClick={onCancel} style={styles.cancelButton}>Cancel</button>
                <button onClick={onConfirm} style={{...styles.deleteConfirmButton}}>
                    <i className="fas fa-trash" style={{marginRight: '0.5rem'}}></i>Delete
                </button>
            </div>
        </div>
    </div>
);


const styles = {
    container: { backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '2rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #dee2e6' },
    headerWelcome: { fontSize: '1.5rem', fontWeight: 'bold' },
    tabsContainer: { display: 'flex', justifyContent: 'center', marginBottom: '2rem' },
    tabs: { display: 'flex', gap: '1rem' },
    tab: { background: 'none', border: 'none', padding: '1rem', cursor: 'pointer', fontSize: '1rem', color: '#495057', fontWeight: 'bold' },
    activeTab: { background: 'none', border: 'none', padding: '1rem', cursor: 'pointer', fontSize: '1rem', color: '#007bff', borderBottom: '3px solid #007bff', fontWeight: 'bold' },
    logoutButton: { backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', cursor: 'pointer', fontWeight: 'bold' },
    subHeader: { display: 'flex', alignItems: 'center', marginBottom: '1rem' },
    contentBox: { backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
    headerTitle: { margin: 0, fontSize: '2rem' },
    headerSubtitle: { margin: 0, color: '#6c757d' },
    createTaskButton: { backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', cursor: 'pointer', fontSize: '1rem', marginLeft: 'auto', fontWeight: 'bold' },
    deleteUserButton: { backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', width: '450px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    modalTitle: { margin: 0, fontSize: '1.5rem' },
    closeButton: { background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#6c757d' },
    viewTaskBody: { lineHeight: 1.6 },
    formLabel: { display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: '1rem' },
    input: { width: '100%', padding: '0.8rem', border: '1px solid #ced4da', borderRadius: '8px', boxSizing: 'border-box', fontSize: '1rem' },
    select: { width: '100%', padding: '0.8rem', border: '1px solid #ced4da', borderRadius: '8px', boxSizing: 'border-box', fontSize: '1rem' },
    statusSelect: { padding: '0.5rem 1rem', borderRadius: '15px', border: 'none', fontWeight: 'bold', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', cursor: 'pointer' },
    statusBadge: { padding: '0.5rem 1rem', borderRadius: '15px', border: 'none', fontWeight: 'bold', display: 'inline-block', cursor: 'default' },
    statusColors: {
        "To Do": { backgroundColor: '#6c757d', color: 'white' },
        "In Progress": { backgroundColor: '#B8860B', color: 'white' },
        "Done": { backgroundColor: '#28a745', color: 'white' },
    },
    disabledStatusSelect: { cursor: 'not-allowed', opacity: 0.7 },
    sectionBreak: { display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' },
    dividerLine: { flex: 1, height: '1px', backgroundColor: '#e9ecef' },
    dividerText: { backgroundColor: '#fff', padding: '0 0.6rem', color: '#495057', fontWeight: 600, fontSize: '0.95rem' },
    centerLine: { width: '100%', height: '1px', backgroundColor: '#e9ecef' },
    sectionCard: { backgroundColor: '#f8fbff', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02)' },
    formActions: { display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' },
    cancelButton: { backgroundColor: '#f8f9fa', border: '1px solid #ced4da', color: '#343a40', padding: '0.75rem 1.5rem', borderRadius: '8px', marginRight: '0.5rem', cursor: 'pointer', fontWeight: 'bold' },
    createButton: { backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    deleteConfirmButton: { backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    errorMsg: { color: '#dc3545', textAlign: 'center', marginTop: '1rem', fontWeight: 'bold'},
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
    th: { textAlign: 'left', padding: '1rem', borderBottom: '2px solid #dee2e6', backgroundColor: '#f8f9fa', fontWeight: 'bold' },
    td: { padding: '1rem', borderBottom: '1px solid #dee2e6' },
    iconButton: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0.5rem' },
    viewAction: { color: '#007bff' },
    editAction: { color: '#ffc107' },
    deleteAction: { color: '#dc3545' }
};