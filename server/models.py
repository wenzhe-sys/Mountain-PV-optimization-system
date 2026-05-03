from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    password_hash = Column(String(200), nullable=False)
    role = Column(String(20), default="user")  # admin / user
    created_at = Column(DateTime, default=datetime.utcnow)

    instances = relationship("Instance", back_populates="uploader")


class Instance(Base):
    __tablename__ = "instances"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    instance_id = Column(String(50), unique=True, index=True, nullable=False)  # e.g. r1, r2
    file_path = Column(String(500))
    n_nodes = Column(Integer, default=0)
    status = Column(String(30), default="uploaded")  # uploaded / processing / completed / failed
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    uploader = relationship("User", back_populates="instances")
    jobs = relationship("ComputationJob", back_populates="instance")


class ComputationJob(Base):
    __tablename__ = "computation_jobs"

    id = Column(Integer, primary_key=True, index=True)
    instance_id = Column(Integer, ForeignKey("instances.id"), nullable=False)
    status = Column(String(30), default="pending")  # pending / running_m1 / running_m2 / running_m3 / completed / failed
    progress = Column(Float, default=0.0)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)

    instance = relationship("Instance", back_populates="jobs")
    results = relationship("ModuleResult", back_populates="job")


class ModuleResult(Base):
    __tablename__ = "module_results"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("computation_jobs.id"), nullable=False)
    instance_id = Column(String(50), index=True, nullable=False)  # e.g. r1
    module = Column(Integer, nullable=False)  # 1, 2, 3
    result_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("ComputationJob", back_populates="results")
