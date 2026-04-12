// src/services/socketClient.ts
import { io, type Socket } from "socket.io-client";
import { config } from "../config";

class SocketClient {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 3;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private isManualDisconnect: boolean = false;
  private isMaxAttemptsReached: boolean = false; // Nueva bandera para máximo de intentos

  connect() {
    try {
      // Si fue una desconexión manual o se alcanzó el máximo de intentos, no reconectar
      if (this.isManualDisconnect || this.isMaxAttemptsReached) {
        if (this.isMaxAttemptsReached) {
          console.log(
            "⏸️  Máximos intentos alcanzados. Reinicia el servidor para intentar nuevamente."
          );
        }
        return;
      }

      console.log(`🔄 Intentando conectar al servidor de sockets: ${config.socketApi}`);

      // Conectar como CLIENTE al servidor en puerto 1999
      this.socket = io(`${config.socketApi}`, {
        transports: ["websocket", "polling"],
        timeout: 5000, // 5 segundos de timeout
        auth: {
          service: "rrhh-backend",
          type: "backend",
        },
      });

      this.socket.on("connect", () => {
        console.log(`✅ Conectado al servidor ${config.socketApi}`);
        this.isConnected = true;
        this.connectionAttempts = 0; // Resetear contador en conexión exitosa
        this.isManualDisconnect = false; // Resetear bandera de desconexión manual
        this.isMaxAttemptsReached = false; // Resetear bandera de máximo intentos

        // Detener cualquier intento de reconexión automática
        this.stopReconnection();

        // Una vez conectado, puedes unirte a rooms
        // this.joinRoom("default-room");
      });

      this.socket.on("disconnect", (reason) => {
        console.log(`🔌 Desconectado del servidor de sockets: ${reason}`);
        this.isConnected = false;

        // Solo intentar reconexión si no fue una desconexión manual y no se alcanzó el máximo
        if (!this.isManualDisconnect && !this.isMaxAttemptsReached) {
          this.handleReconnection();
        }
      });

      this.socket.on("connect_error", () => {
        // Solo contar intentos si no es una desconexión manual y no se alcanzó el máximo
        if (!this.isManualDisconnect && !this.isMaxAttemptsReached) {
          this.connectionAttempts++;
          console.log(
            `❌ Intento ${this.connectionAttempts}/${this.maxConnectionAttempts} - No se pudo conectar al servidor de sockets`
          );

          if (this.connectionAttempts >= this.maxConnectionAttempts) {
            console.log("⏸️  Máximos intentos alcanzados. Servicio de sockets no disponible.");
            console.log("💡 Reinicia el servidor para intentar la conexión nuevamente.");
            this.isMaxAttemptsReached = true;
            this.stopReconnection();
          }
        }
      });

      // Escuchar eventos del servidor
      this.socket.on("joined_room", (data: unknown) => {
        console.log("🎯 Unido a room exitosamente:", data);
      });
    } catch (error: unknown) {
      console.log("⚠️  Error al inicializar conexión de socket");
    }
  }

  private handleReconnection() {
    // Solo intentar reconexión si no fue manual, no se alcanzó el máximo y no hay intervalo activo
    if (
      !this.isManualDisconnect &&
      !this.isMaxAttemptsReached &&
      !this.reconnectInterval &&
      this.connectionAttempts < this.maxConnectionAttempts
    ) {
      console.log("🔄 Intentando reconexión automática en 5 segundos...");

      this.reconnectInterval = setInterval(() => {
        // Verificar condiciones antes de cada reintento
        if (
          !this.isManualDisconnect &&
          !this.isMaxAttemptsReached &&
          this.connectionAttempts < this.maxConnectionAttempts
        ) {
          console.log(
            `🔄 Reintentando conexión (${this.connectionAttempts + 1}/${
              this.maxConnectionAttempts
            })...`
          );
          this.connect();
        } else {
          this.stopReconnection();
        }
      }, 5000); // Reintentar cada 5 segundos
    }
  }

  private stopReconnection() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
      console.log("⏹️  Detenidos intentos de reconexión automática");
    }
  }

  // Unirse a una room específica
  joinRoom(roomId: string, direction: string = "rrhh"): boolean {
    if (!this.socket || !this.isConnected) {
      console.log("⚠️  No se puede unir a room - Socket no conectado");
      return false;
    }

    try {
      const roomData = {
        roomId: roomId,
        direction: direction,
      };

      console.log(`🚪 Uniéndose a room: ${direction}-${roomId}`);
      this.socket.emit("join_room", roomData);
      return true;
    } catch (error) {
      console.log("⚠️  Error al unirse a room");
      return false;
    }
  }

  // Dejar una room
  leaveRoom(roomId: string, direction: string = "rrhh"): boolean {
    if (!this.socket || !this.isConnected) {
      console.log("⚠️  No se puede dejar room - Socket no conectado");
      return false;
    }

    try {
      const roomData = {
        roomId: roomId,
        direction: direction,
      };

      this.socket.emit("leave_room", roomData);
      console.log(`🚪 Dejando room: ${direction}-${roomId}`);
      return true;
    } catch (error) {
      console.log("⚠️  Error al dejar room");
      return false;
    }
  }

  // Enviar mensaje a una room
  sendToRoom(roomId: string, direction: string, event: string, data: any): boolean {
    if (!this.socket || !this.isConnected) {
      console.log("⚠️  No se puede enviar mensaje - Socket no conectado");
      return false;
    }

    try {
      const roomName = `${direction}-${roomId}`;
      this.socket.emit(event, { ...data, room: roomName });
      console.log(`📤 Mensaje enviado a ${roomName}: ${event}`);
      return true;
    } catch (error) {
      console.log("⚠️  Error al enviar mensaje a room");
      return false;
    }
  }

  // Escuchar eventos específicos
  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  // Emitir eventos personalizados
  emit(event: string, data: any): boolean {
    console.log(event);

    if (!this.socket || !this.isConnected) {
      console.log("⚠️  No se puede emitir evento - Socket no conectado");
      return false;
    }

    try {
      this.socket.emit(event, data);
      return true;
    } catch (error) {
      console.log("⚠️  Error al emitir evento");
      return false;
    }
  }

  // Desconectar
  disconnect() {
    this.isManualDisconnect = true; // Marcar como desconexión manual
    this.stopReconnection();
    this.socket?.disconnect();
    this.isConnected = false;
    console.log("🔌 Conexión de socket cerrada manualmente");
  }

  // Verificar estado de conexión
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Obtener información del estado de conexión
  getConnectionInfo() {
    return {
      connected: this.isConnected,
      connectionAttempts: this.connectionAttempts,
      maxAttempts: this.maxConnectionAttempts,
      socketId: this.socket?.id || null,
      isManualDisconnect: this.isManualDisconnect,
      isMaxAttemptsReached: this.isMaxAttemptsReached,
      message: this.isMaxAttemptsReached
        ? "Máximos intentos alcanzados. Reinicia el servidor."
        : "Conexión activa o en intento",
    };
  }

  // Forzar reconexión manual (ahora solo funciona si no se alcanzó el máximo)
  manualReconnect() {
    if (this.isMaxAttemptsReached) {
      console.log("❌ No se puede reconectar manualmente - Máximos intentos alcanzados");
      console.log("💡 Reinicia el servidor para intentar la conexión nuevamente.");
      return false;
    }

    console.log("🔄 Reconexión manual solicitada");
    this.isManualDisconnect = false; // Permitir reconexión
    this.connectionAttempts = 0;
    this.stopReconnection();
    this.socket?.disconnect(); // Desconectar primero si está conectado
    setTimeout(() => this.connect(), 1000);
    return true;
  }

  // Método para resetear completamente el cliente (solo para uso interno)
  private reset() {
    this.isManualDisconnect = false;
    this.connectionAttempts = 0;
    this.isMaxAttemptsReached = false;
    this.stopReconnection();
    this.socket?.disconnect();
    this.socket = null;
    this.isConnected = false;
    console.log("🔄 Cliente de socket reseteado completamente");
  }
}

export const socketClient = new SocketClient();
