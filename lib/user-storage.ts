interface User {
  id: string
  email: string
  name: string
  role: string
  password: string
  createdAt: string
}

class UserStorage {
  private static instance: UserStorage
  private users: User[] = []
  private listeners: (() => void)[] = []

  private constructor() {
    this.loadUsers()
  }

  static getInstance(): UserStorage {
    if (!UserStorage.instance) {
      UserStorage.instance = new UserStorage()
    }
    return UserStorage.instance
  }

  private loadUsers() {
    if (typeof window !== "undefined") {
      try {
        const storedUsers = localStorage.getItem("registeredUsers")
        if (storedUsers) {
          this.users = JSON.parse(storedUsers)
        } else {
          // Initialize with demo users
          this.users = [
            {
              id: "1",
              email: "admin@example.com",
              name: "Admin User",
              role: "admin",
              password: "password",
              createdAt: new Date().toISOString(),
            },
            {
              id: "2",
              email: "customer@example.com",
              name: "Customer User",
              role: "customer",
              password: "password",
              createdAt: new Date().toISOString(),
            },
          ]
          this.saveUsers()
        }
      } catch (error) {
        console.error("Error loading users:", error)
        this.users = []
      }
    }
  }

  private saveUsers() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("registeredUsers", JSON.stringify(this.users))
        this.notifyListeners()
      } catch (error) {
        console.error("Error saving users:", error)
      }
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener())
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  getAllUsers(): User[] {
    return [...this.users]
  }

  getUserByEmail(email: string): User | null {
    return this.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null
  }

  createUser(userData: Omit<User, "id" | "createdAt">): User {
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }

    this.users.push(newUser)
    this.saveUsers()
    return newUser
  }

  validateCredentials(email: string, password: string): User | null {
    const user = this.getUserByEmail(email)
    if (user && user.password === password) {
      return user
    }
    return null
  }

  getUserCount(): number {
    return this.users.length
  }

  getRecentUsers(limit = 5): User[] {
    return this.users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit)
  }
}

export const userStorage = UserStorage.getInstance()
